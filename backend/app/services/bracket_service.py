"""
Single-elimination knockout bracket generator.

Given N approved teams, generates a full bracket:
- Rounds: Round of 32 → Round of 16 → Quarter-Final → Semi-Final → Final
- Supports any power-of-2 team count (8, 16, 32)
- If team count is not a power of 2, top seeds get byes
- Winners auto-advance when a match is completed
"""
import math
import random
import uuid
from datetime import datetime, timedelta
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.match import Match
from app.models.team import Team

DEFAULT_VENUE = "Rongbong Ronghang Playground"
# First match starts at 9 AM, each match 90 min apart
FIRST_MATCH_TIME = datetime(2026, 6, 15, 9, 0, 0)
MATCH_INTERVAL_MINUTES = 90


def _next_power_of_2(n: int) -> int:
    return 2 ** math.ceil(math.log2(n)) if n > 1 else 2


def _round_name(size: int) -> str:
    """Generate round name based on number of teams in that round."""
    if size == 2:
        return "Final"
    elif size == 4:
        return "Semi-Final"
    elif size == 8:
        return "Quarter-Final"
    else:
        # For larger rounds, calculate which round number this is
        # Round 1: 32 teams, Round 2: 16 teams, Round 3: 8 teams, etc.
        round_num = int(math.log2(size))
        return f"Round {round_num - 1}"


async def generate_bracket(
    db: AsyncSession,
    teams: List[Team],
    venue: str = DEFAULT_VENUE,
    first_match_time: Optional[datetime] = None,
) -> List[Match]:
    """
    Generate a full single-elimination bracket for the given teams.
    Returns all created Match objects (not yet committed).
    """
    if len(teams) < 2:
        raise ValueError("Need at least 2 teams to generate a bracket")

    if first_match_time is None:
        first_match_time = FIRST_MATCH_TIME

    # Shuffle teams for random seeding
    shuffled = list(teams)
    random.shuffle(shuffled)

    bracket_size = _next_power_of_2(len(shuffled))
    # Pad with None for byes if not a perfect power of 2
    padded: List[Optional[Team]] = shuffled + [None] * (bracket_size - len(shuffled))

    all_matches: List[Match] = []
    match_time = first_match_time
    slot_counter = 1

    # Build rounds bottom-up: first round has bracket_size/2 matches
    # We create all rounds upfront with empty team slots, then link them

    # Round 1 matches
    current_round_matches: List[Match] = []
    round_size = bracket_size
    round_matches_by_round: dict[str, List[Match]] = {}

    while round_size >= 2:
        round_name = _round_name(round_size)
        num_matches = round_size // 2
        round_matches: List[Match] = []

        for i in range(num_matches):
            if round_size == bracket_size:
                # First round — assign actual teams (or None for bye)
                team_a = padded[i * 2]
                team_b = padded[i * 2 + 1]

                if team_a is None and team_b is None:
                    # Both bye — skip (don't create match)
                    continue
                elif team_a is None or team_b is None:
                    # One team gets a bye — they advance automatically, no match needed
                    continue

                m = Match(
                    team_a_id=team_a.id,
                    team_b_id=team_b.id,
                    round=round_name,
                    scheduled_at=match_time,
                    venue=venue,
                    bracket_slot=slot_counter,
                    status="scheduled",
                )
            else:
                # Later rounds — TBD teams (will be filled when winners advance)
                # Use a placeholder UUID that will be replaced
                m = Match(
                    team_a_id=None,  # type: ignore  — filled when winner advances
                    team_b_id=None,  # type: ignore
                    round=round_name,
                    scheduled_at=match_time,
                    venue=venue,
                    bracket_slot=slot_counter,
                    status="scheduled",
                )

            db.add(m)
            round_matches.append(m)
            all_matches.append(m)
            match_time += timedelta(minutes=MATCH_INTERVAL_MINUTES)
            slot_counter += 1

        round_matches_by_round[round_name] = round_matches
        current_round_matches = round_matches
        round_size //= 2

    # Now flush to get IDs, then link next_match_id
    await db.flush()

    # Link matches: pair up current round → next round
    await _link_bracket(db, round_matches_by_round)

    return all_matches


async def _link_bracket(db: AsyncSession, round_matches_by_round: dict[str, List[Match]]) -> None:
    """Set next_match_id and next_match_slot on each match using the round map."""
    round_order = list(round_matches_by_round.keys())
    
    for i in range(len(round_order) - 1):
        current = round_matches_by_round[round_order[i]]
        next_round = round_matches_by_round[round_order[i + 1]]

        for j, match in enumerate(current):
            next_idx = j // 2
            if next_idx < len(next_round):
                match.next_match_id = next_round[next_idx].id
                match.next_match_slot = "a" if j % 2 == 0 else "b"


async def advance_winner(db: AsyncSession, match: Match) -> None:
    """
    Called when a match is completed.
    Determines the winner and places them in the next match.
    """
    if match.team_a_score is None or match.team_b_score is None:
        return
    if match.next_match_id is None:
        return  # Final — no next match

    if match.team_a_score > match.team_b_score:
        winner_id = match.team_a_id
    elif match.team_b_score > match.team_a_score:
        winner_id = match.team_b_id
    else:
        # Draw — in knockout, this shouldn't happen (use penalties in real life)
        # For now, team_a advances on draw (admin should handle this manually)
        winner_id = match.team_a_id

    # Load the next match
    result = await db.execute(select(Match).where(Match.id == match.next_match_id))
    next_match = result.scalar_one_or_none()
    if next_match is None:
        return

    if match.next_match_slot == "a":
        next_match.team_a_id = winner_id
    else:
        next_match.team_b_id = winner_id
