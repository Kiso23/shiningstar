"""
PDF generation service using ReportLab.
Generates a team registration card matching the frontend PDF design.
"""
import io
from datetime import datetime
from typing import List, Optional

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

ORANGE = colors.HexColor('#f97316')
DARK   = colors.HexColor('#1e1e1e')
GRAY   = colors.HexColor('#6b7280')
LIGHT  = colors.HexColor('#f8f8f8')
WHITE  = colors.white


def generate_registration_pdf(
    team_name: str,
    registration_id: str,
    status: str,
    manager_name: str,
    contact_phone: str,
    contact_email: str,
    player_count: int,
    created_at: datetime,
    players: List[dict],  # list of {full_name, age, jersey_number, position, position_index}
) -> bytes:
    """Generate a registration PDF and return as bytes."""
    buffer = io.BytesIO()
    page_w, page_h = A4
    margin = 20 * mm

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=margin,
        rightMargin=margin,
        topMargin=0,
        bottomMargin=15 * mm,
    )

    styles = getSampleStyleSheet()
    story = []

    # ── Orange header banner ──────────────────────────────────────────────────
    header_data = [['SHINING STAR UNITED FC']]
    header_table = Table(header_data, colWidths=[page_w - 2 * margin])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), ORANGE),
        ('TEXTCOLOR', (0, 0), (-1, -1), WHITE),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 16),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(header_table)

    # ── Dark subtitle bar ─────────────────────────────────────────────────────
    sub_data = [['Team Registration Details']]
    sub_table = Table(sub_data, colWidths=[page_w - 2 * margin])
    sub_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), DARK),
        ('TEXTCOLOR', (0, 0), (-1, -1), WHITE),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(sub_table)
    story.append(Spacer(1, 8 * mm))

    # ── Team name + ID + Status ───────────────────────────────────────────────
    name_style = ParagraphStyle('name', fontName='Helvetica-Bold', fontSize=18, textColor=DARK)
    story.append(Paragraph(team_name, name_style))
    story.append(Spacer(1, 2 * mm))

    id_status_data = [[
        Paragraph(f'<font color="#6b7280" size="9">Registration ID: {registration_id}</font>', styles['Normal']),
        Paragraph(f'<font color="#6b7280" size="9">Status: {status.upper()}</font>', ParagraphStyle('right', alignment=TA_RIGHT, fontSize=9, textColor=GRAY)),
    ]]
    id_table = Table(id_status_data, colWidths=[(page_w - 2 * margin) * 0.6, (page_w - 2 * margin) * 0.4])
    id_table.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    story.append(id_table)
    story.append(Spacer(1, 4 * mm))

    # ── Orange divider ────────────────────────────────────────────────────────
    story.append(HRFlowable(width='100%', thickness=1.5, color=ORANGE))
    story.append(Spacer(1, 5 * mm))

    # ── Team Information ──────────────────────────────────────────────────────
    section_style = ParagraphStyle('section', fontName='Helvetica-Bold', fontSize=12, textColor=DARK)
    story.append(Paragraph('Team Information', section_style))
    story.append(Spacer(1, 4 * mm))

    date_str = created_at.strftime('%-d %B %Y') if hasattr(created_at, 'strftime') else str(created_at)
    info_rows = [
        ['Manager Name:', manager_name],
        ['Contact Phone:', contact_phone],
        ['Contact Email:', contact_email],
        ['Number of Players:', str(player_count)],
        ['Registration Date:', date_str],
    ]

    label_style = ParagraphStyle('label', fontName='Helvetica-Bold', fontSize=10, textColor=colors.HexColor('#505050'))
    value_style = ParagraphStyle('value', fontName='Helvetica', fontSize=10, textColor=DARK)

    for label, value in info_rows:
        row_data = [[Paragraph(label, label_style), Paragraph(value, value_style)]]
        row_table = Table(row_data, colWidths=[45 * mm, page_w - 2 * margin - 45 * mm])
        row_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ]))
        story.append(row_table)

    story.append(Spacer(1, 6 * mm))

    # ── Players ───────────────────────────────────────────────────────────────
    if players:
        story.append(HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#d1d5db')))
        story.append(Spacer(1, 5 * mm))

        story.append(Paragraph(f'Player Roster ({len(players)} players)', section_style))
        story.append(Spacer(1, 4 * mm))

        # Table header
        col_w = page_w - 2 * margin
        table_data = [['#', 'Player Name', 'Age', 'Jersey', 'Position']]

        sorted_players = sorted(players, key=lambda p: p.get('position_index', 0))
        for i, p in enumerate(sorted_players, 1):
            table_data.append([
                str(i),
                p.get('full_name', ''),
                str(p.get('age', '')),
                str(p.get('jersey_number', '—')),
                p.get('position', '—'),
            ])

        player_table = Table(
            table_data,
            colWidths=[10 * mm, 65 * mm, 20 * mm, 25 * mm, 40 * mm],
        )

        # Build alternating row styles
        table_style = [
            # Header row
            ('BACKGROUND', (0, 0), (-1, 0), ORANGE),
            ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('ALIGN', (0, 0), (-1, 0), 'LEFT'),
            ('TOPPADDING', (0, 0), (-1, 0), 5),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 5),
            # Data rows
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('TEXTCOLOR', (0, 1), (-1, -1), DARK),
            ('TOPPADDING', (0, 1), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 4),
            ('GRID', (0, 0), (-1, -1), 0.3, colors.HexColor('#e5e7eb')),
        ]
        # Alternating row backgrounds
        for row_idx in range(1, len(table_data)):
            bg = LIGHT if row_idx % 2 == 1 else WHITE
            table_style.append(('BACKGROUND', (0, row_idx), (-1, row_idx), bg))

        player_table.setStyle(TableStyle(table_style))
        story.append(player_table)

    story.append(Spacer(1, 8 * mm))

    # ── Footer ────────────────────────────────────────────────────────────────
    story.append(HRFlowable(width='100%', thickness=1, color=ORANGE))
    story.append(Spacer(1, 3 * mm))

    footer_style = ParagraphStyle('footer', fontName='Helvetica-Oblique', fontSize=8,
                                   textColor=GRAY, alignment=TA_CENTER)
    story.append(Paragraph('Shining Star United FC — Tournament Registration System', footer_style))
    story.append(Paragraph(f'Generated: {datetime.utcnow().strftime("%d %B %Y, %H:%M UTC")}', footer_style))

    doc.build(story)
    return buffer.getvalue()


# ── Rules & Regulations PDF ───────────────────────────────────────────────────

TOURNAMENT_RULES = [
    ("1. Laws of the Game",
     "All matches will be played according to the official Laws of the Game (FIFA/AIFF) adopted by Assam Football Association."),
    ("2. Team & Players",
     "• Each team can register up to 15–18 players\n• Only registered players are allowed to play\n• A player cannot represent more than one team"),
    ("3. Player Identification",
     "• Players must produce valid ID proof if required\n• Any fake player will lead to disqualification"),
    ("4. Match Duration",
     "• Each match: 30 minutes (15–15 halves)\n• 5–10 minutes break (Organizer may adjust based on schedule)"),
    ("5. Equipment",
     "• Proper jersey, shorts, socks, shin guards mandatory\n• No dangerous items allowed"),
    ("6. Substitution Rules",
     "Rolling substitutions allowed (as per local tournament rules)"),
    ("7. Referee Authority",
     "• Match will be controlled by official referee\n• Referee decision is final and binding"),
    ("8. Discipline",
     "• Yellow card = warning\n• Two yellow cards = suspension for next match\n• Red card = direct suspension (decision by committee)"),
    ("9. Reporting Time",
     "• Teams must report at least 30 minutes before match\n• Late team may be given walkover"),
    ("10. Match Result",
     "• Draw match → Direct penalty shootout\n• No extra time (unless decided by organizers)"),
    ("11. Protest & Appeal",
     "• Any protest must be submitted immediately after match\n• Decision of organizing committee will be final"),
    ("12. Misconduct",
     "Any indiscipline, fighting, or abuse will lead to disqualification"),
    ("13. Organizer Rights",
     "Organizing committee reserves the right to modify rules if necessary"),
]


def generate_rules_pdf() -> bytes:
    """Generate the Rules & Regulations PDF and return as bytes."""
    buffer = io.BytesIO()
    page_w, page_h = A4
    margin = 20 * mm

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=margin,
        rightMargin=margin,
        topMargin=0,
        bottomMargin=15 * mm,
    )

    story = []

    # ── Orange header ─────────────────────────────────────────────────────────
    header_data = [['SHINING STAR UNITED FC']]
    header_table = Table(header_data, colWidths=[page_w - 2 * margin])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), ORANGE),
        ('TEXTCOLOR', (0, 0), (-1, -1), WHITE),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 16),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(header_table)

    sub_data = [['SSU Champions Trophy — Rules & Regulations']]
    sub_table = Table(sub_data, colWidths=[page_w - 2 * margin])
    sub_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), DARK),
        ('TEXTCOLOR', (0, 0), (-1, -1), WHITE),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(sub_table)
    story.append(Spacer(1, 6 * mm))

    # ── Intro ─────────────────────────────────────────────────────────────────
    intro_style = ParagraphStyle('intro', fontName='Helvetica-Bold', fontSize=10,
                                  textColor=DARK, spaceAfter=4)
    story.append(Paragraph(
        'Rules & Regulations of the Tournament: SSU Champions Trophy',
        intro_style
    ))
    sub_intro = ParagraphStyle('subintro', fontName='Helvetica', fontSize=9,
                                textColor=GRAY, spaceAfter=6)
    story.append(Paragraph(
        'Follow as per Assam Football Association / AIFF Guidelines.',
        sub_intro
    ))
    story.append(HRFlowable(width='100%', thickness=1, color=ORANGE))
    story.append(Spacer(1, 4 * mm))

    # ── Rules ─────────────────────────────────────────────────────────────────
    title_style = ParagraphStyle('rtitle', fontName='Helvetica-Bold', fontSize=10,
                                  textColor=ORANGE, spaceBefore=6, spaceAfter=2)
    body_style = ParagraphStyle('rbody', fontName='Helvetica', fontSize=9,
                                 textColor=DARK, leading=14, spaceAfter=4,
                                 leftIndent=4 * mm)

    for title, body in TOURNAMENT_RULES:
        story.append(Paragraph(title, title_style))
        # Replace \n with <br/> for ReportLab
        body_html = body.replace('\n', '<br/>')
        story.append(Paragraph(body_html, body_style))

    story.append(Spacer(1, 6 * mm))
    story.append(HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#d1d5db')))
    story.append(Spacer(1, 3 * mm))

    # ── Note ──────────────────────────────────────────────────────────────────
    note_style = ParagraphStyle('note', fontName='Helvetica-Bold', fontSize=9,
                                 textColor=DARK, alignment=TA_CENTER)
    story.append(Paragraph(
        'Note: Fair play, discipline, and respect must be maintained as per AFA standards. Thank you!',
        note_style
    ))
    story.append(Spacer(1, 4 * mm))

    # ── Footer ────────────────────────────────────────────────────────────────
    story.append(HRFlowable(width='100%', thickness=1, color=ORANGE))
    story.append(Spacer(1, 3 * mm))
    footer_style = ParagraphStyle('footer', fontName='Helvetica-Oblique', fontSize=8,
                                   textColor=GRAY, alignment=TA_CENTER)
    story.append(Paragraph('Shining Star United FC — Tournament Registration System', footer_style))
    story.append(Paragraph(
        f'Generated: {datetime.utcnow().strftime("%d %B %Y, %H:%M UTC")}',
        footer_style
    ))

    doc.build(story)
    return buffer.getvalue()
