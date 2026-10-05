from pathlib import Path

from reportlab.lib.colors import Color, HexColor
from reportlab.lib.pagesizes import landscape, letter
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "public" / "downloads" / "datacenter-concept-system-diagram.pdf"

NAVY = HexColor("#153B60")
NAVY_2 = HexColor("#234F72")
GOLD = HexColor("#B88845")
POWER = HexColor("#D28D2D")
COOL = HexColor("#2D9EAC")
DATA = HexColor("#6B63A8")
GREEN = HexColor("#4F856B")
RED = HexColor("#A95542")
INK = HexColor("#1F3D52")
MUTED = HexColor("#607686")
LINE = HexColor("#BFCED7")
PALE = HexColor("#EEF3F6")
SITE = HexColor("#F5F7F8")
WHITE = HexColor("#FFFFFF")


def wrap(text: str, font: str, size: float, width: float) -> list[str]:
    lines: list[str] = []
    current = ""
    for word in text.split():
        test = word if not current else f"{current} {word}"
        if stringWidth(test, font, size) <= width:
            current = test
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def label(c: canvas.Canvas, x: float, y: float, text: str, size=6.2, color=INK, bold=False):
    c.setFillColor(color)
    c.setFont("Helvetica-Bold" if bold else "Helvetica", size)
    c.drawString(x, y, text)


def centered(c: canvas.Canvas, x: float, y: float, text: str, size=6.2, color=INK, bold=False):
    c.setFillColor(color)
    c.setFont("Helvetica-Bold" if bold else "Helvetica", size)
    c.drawCentredString(x, y, text)


def arrow(c: canvas.Canvas, points: list[tuple[float, float]], color: Color, width=2.0, dashed=False):
    c.setStrokeColor(color)
    c.setFillColor(color)
    c.setLineWidth(width)
    c.setLineCap(1)
    c.setLineJoin(1)
    c.setDash(6, 3) if dashed else c.setDash()
    path = c.beginPath()
    path.moveTo(*points[0])
    for point in points[1:]:
        path.lineTo(*point)
    c.drawPath(path, stroke=1, fill=0)
    c.setDash()
    if len(points) > 1:
        (x1, y1), (x2, y2) = points[-2], points[-1]
        dx, dy = x2 - x1, y2 - y1
        length = max((dx * dx + dy * dy) ** 0.5, 0.001)
        ux, uy = dx / length, dy / length
        px, py = -uy, ux
        back_x, back_y = x2 - ux * 6, y2 - uy * 6
        path = c.beginPath()
        path.moveTo(x2, y2)
        path.lineTo(back_x + px * 3, back_y + py * 3)
        path.lineTo(back_x - px * 3, back_y - py * 3)
        path.close()
        c.drawPath(path, stroke=0, fill=1)


def rack(c: canvas.Canvas, x: float, y: float, w=8, h=15, secure=False):
    c.setFillColor(HexColor("#CAD6DE") if not secure else HexColor("#D7D1E9"))
    c.setStrokeColor(NAVY if not secure else DATA)
    c.setLineWidth(0.45)
    c.roundRect(x, y, w, h, 1.2, fill=1, stroke=1)
    c.setStrokeColor(Color(1, 1, 1, alpha=0.8))
    for offset in (4, 8, 12):
        c.line(x + 1.5, y + offset, x + w - 1.5, y + offset)


def rack_rows(c: canvas.Canvas, x: float, y: float, cols: int, rows: int, secure=False):
    for row in range(rows):
        for col in range(cols):
            rack(c, x + col * 13, y + row * 22, secure=secure)


def fan(c: canvas.Canvas, x: float, y: float, r=7):
    c.setFillColor(HexColor("#D7ECEE"))
    c.setStrokeColor(COOL)
    c.setLineWidth(0.7)
    c.circle(x, y, r, fill=1, stroke=1)
    c.line(x - r + 2, y, x + r - 2, y)
    c.line(x, y - r + 2, x, y + r - 2)
    c.circle(x, y, 1.4, fill=0, stroke=1)


def generator(c: canvas.Canvas, x: float, y: float, w=23, h=13):
    c.setFillColor(HexColor("#E8E1D5"))
    c.setStrokeColor(GOLD)
    c.roundRect(x, y, w, h, 2, fill=1, stroke=1)
    c.circle(x + 5, y - 1, 1.4, fill=1, stroke=0)
    c.circle(x + w - 5, y - 1, 1.4, fill=1, stroke=0)
    centered(c, x + w / 2, y + 4.5, "GEN", 4.8, NAVY, True)


def zone(c: canvas.Canvas, x: float, y: float, w: float, h: float, title: str, subtitle: str = "", fill=WHITE, stroke=LINE, dashed=False):
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.setLineWidth(0.8)
    c.setDash(4, 2) if dashed else c.setDash()
    c.roundRect(x, y, w, h, 3, fill=1, stroke=1)
    c.setDash()
    label(c, x + 5, y + h - 10, title, 6.5, NAVY, True)
    if subtitle:
        label(c, x + 5, y + h - 18, subtitle, 4.8, MUTED)


def callout(c: canvas.Canvas, x: float, y: float, w: float, number: str, title: str, body: str, color=RED):
    c.setFillColor(WHITE)
    c.setStrokeColor(LINE)
    c.roundRect(x, y, w, 58, 4, fill=1, stroke=1)
    c.setFillColor(color)
    c.circle(x + 15, y + 43, 8, fill=1, stroke=0)
    centered(c, x + 15, y + 40.5, number, 6.2, WHITE, True)
    label(c, x + 29, y + 43, title, 7.1, NAVY, True)
    ty = y + 30
    for line in wrap(body, "Helvetica", 5.5, w - 20)[:4]:
        label(c, x + 10, ty, line, 5.5, INK)
        ty -= 7


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=landscape(letter))
    c.setTitle("25 MW AI Data Center - Conceptual Site Layout and System Paths")
    c.setAuthor("University Consortium AI Data Center Study")
    c.setSubject("Conceptual physical layout with power, cooling, network and failure paths")
    width, height = landscape(letter)

    c.setFillColor(WHITE)
    c.rect(0, 0, width, height, fill=1, stroke=0)

    c.setFillColor(NAVY)
    c.rect(0, height - 65, width, 65, fill=1, stroke=0)
    label(c, 28, height - 20, "CONCEPTUAL SITE LAYOUT + SYSTEM PATHS", 7.2, GOLD, True)
    label(c, 28, height - 44, "25 MW AI Data Center", 19, WHITE, True)
    label(c, 230, height - 42, "Stage 1: 12 MW  |  Stage 2: 15 MW  |  Expansion envelope: 25 MW facility input", 7.4, WHITE)
    label(c, 230, height - 54, "Assignment baseline: 20 MW IT at PUE 1.25", 6.5, HexColor("#C8D6E0"))

    site_x, site_y, site_w, site_h = 28, 151, 555, 382
    c.setFillColor(SITE)
    c.setStrokeColor(LINE)
    c.setLineWidth(1)
    c.roundRect(site_x, site_y, site_w, site_h, 7, fill=1, stroke=1)
    label(c, site_x + 10, site_y + site_h + 5, "CONCEPTUAL SITE PLAN - NOT TO SCALE", 6.2, MUTED, True)

    c.setStrokeColor(HexColor("#8FA3AF"))
    c.setDash(3, 3)
    c.roundRect(site_x + 10, site_y + 17, site_w - 20, site_h - 37, 5, fill=0, stroke=1)
    c.setDash()
    c.setFillColor(HexColor("#DDE3E6"))
    c.roundRect(48, 163, 515, 31, 5, fill=1, stroke=0)
    c.setStrokeColor(WHITE)
    c.setDash(8, 5)
    c.line(61, 178, 549, 178)
    c.setDash()
    label(c, 49, 198, "SECURE ACCESS ROAD / FIRE LANE", 5.3, MUTED, True)
    c.setFillColor(GREEN)
    c.roundRect(48, 163, 45, 31, 4, fill=1, stroke=0)
    centered(c, 70.5, 181, "SECURITY", 5.4, WHITE, True)
    centered(c, 70.5, 173, "GATE", 5.4, WHITE, True)

    zone(c, 45, 351, 94, 117, "UTILITY YARD", "Grid intake + substation", HexColor("#F3EDE2"), GOLD)
    zone(c, 55, 404, 74, 49, "MV SWITCHGEAR", "Sectionalized A/B", WHITE, GOLD)
    zone(c, 55, 363, 32, 31, "TX-A", "", WHITE, POWER)
    zone(c, 97, 363, 32, 31, "TX-B", "", WHITE, POWER)
    label(c, 55, 342, "Power capacity / voltage / delivery date TBD", 4.7, MUTED)

    zone(c, 45, 224, 94, 112, "GENERATOR YARD", "Critical-load backup", HexColor("#F3EDE2"), GOLD)
    for row in range(3):
        for col in range(2):
            generator(c, 56 + col * 35, 290 - row * 22)
    label(c, 55, 238, "48-hour fuel logistics", 4.7, RED, True)
    label(c, 55, 230, "and emissions approval TBD", 4.7, MUTED)

    bx, by, bw, bh = 156, 213, 365, 277
    c.setFillColor(WHITE)
    c.setStrokeColor(NAVY)
    c.setLineWidth(2)
    c.roundRect(bx, by, bw, bh, 5, fill=1, stroke=1)
    c.setFillColor(NAVY)
    c.rect(bx, by + bh - 22, bw, 22, fill=1, stroke=0)
    label(c, bx + 8, by + bh - 15, "CONTROLLED DATA CENTER BUILDING", 7.2, WHITE, True)

    zone(c, 165, 372, 65, 87, "ELECTRICAL A", "UPS A + PDU A", HexColor("#F7ECD9"), GOLD)
    zone(c, 165, 270, 65, 87, "ELECTRICAL B", "UPS B + PDU B", HexColor("#F7ECD9"), GOLD)
    for py in (389, 410, 431):
        c.setFillColor(HexColor("#D9A85C"))
        c.roundRect(177, py, 41, 10, 1.5, fill=1, stroke=0)
    for py in (287, 308, 329):
        c.setFillColor(HexColor("#D9A85C"))
        c.roundRect(177, py, 41, 10, 1.5, fill=1, stroke=0)

    zone(c, 240, 355, 126, 104, "DATA HALL A", "GPU / CPU - general zone", HexColor("#F8FAFB"), NAVY)
    zone(c, 376, 355, 126, 104, "DATA HALL B", "GPU / CPU - general zone", HexColor("#F8FAFB"), NAVY)
    rack_rows(c, 251, 371, 8, 3)
    rack_rows(c, 387, 371, 8, 3)
    c.setFillColor(HexColor("#D8EEF0"))
    c.rect(354, 362, 6, 84, fill=1, stroke=0)
    c.rect(492, 362, 6, 84, fill=1, stroke=0)
    centered(c, 357, 452, "CDU", 4.2, COOL, True)
    centered(c, 495, 452, "CDU", 4.2, COOL, True)

    zone(c, 240, 270, 126, 70, "SECURE DATA HALL", "Restricted enclave", HexColor("#F0EDF7"), DATA)
    rack_rows(c, 252, 281, 8, 2, secure=True)
    zone(c, 376, 270, 126, 70, "STORAGE + CPU HALL", "Fabric + recovery tiers", HexColor("#EDF4F6"), NAVY_2)
    for col in range(8):
        rack(c, 389 + col * 12.5, 286, w=7.5, h=28)

    zone(c, 165, 224, 65, 31, "MMR A / B", "Diverse carrier entry", HexColor("#EEEAF6"), DATA)
    zone(c, 240, 224, 82, 31, "NOC + SECURITY", "24x7 operations", HexColor("#E8F1EC"), GREEN)
    zone(c, 332, 224, 81, 31, "STAGING / SPARES", "Service access", PALE, LINE)
    zone(c, 423, 224, 79, 31, "OFFICE / SUPPORT", "Non-critical", PALE, LINE)

    c.setFillColor(HexColor("#E4E9EC"))
    c.rect(230, 213, 10, 246, fill=1, stroke=0)
    c.rect(366, 270, 10, 189, fill=1, stroke=0)
    centered(c, 235, 262, "SERVICE", 4.1, MUTED, True)

    zone(c, 158, 497, 363, 27, "COOLING / HEAT REJECTION YARD", "N+1 capacity, water and climate fit to be engineered", HexColor("#EAF5F6"), COOL)
    for col in range(10):
        fan(c, 321 + col * 18, 510, 5.2)
    zone(c, 165, 501, 125, 19, "PUMPS + PRIMARY LOOP", "", WHITE, COOL)

    zone(c, 530, 224, 42, 266, "FUTURE", "20-25 MW", Color(1, 1, 1, alpha=0.25), HexColor("#8EA0AA"), dashed=True)
    centered(c, 551, 346, "EXPANSION", 5.3, MUTED, True)
    centered(c, 551, 337, "RESERVE", 5.3, MUTED, True)

    arrow(c, [(31, 437), (55, 437)], POWER, 2.8)
    label(c, 31, 445, "GRID", 5.1, POWER, True)
    arrow(c, [(129, 379), (150, 379), (150, 414), (165, 414)], POWER, 2.2)
    arrow(c, [(129, 379), (150, 379), (150, 312), (165, 312)], POWER, 2.2)
    arrow(c, [(230, 414), (240, 414)], POWER, 2.2)
    arrow(c, [(230, 312), (240, 312)], POWER, 2.2)
    arrow(c, [(139, 278), (149, 278), (149, 399), (165, 399)], POWER, 1.8, True)
    label(c, 72, 214, "BACKUP POWER", 5.0, POWER, True)

    arrow(c, [(300, 497), (300, 470), (357, 470), (357, 459)], COOL, 2.2)
    arrow(c, [(442, 497), (442, 470), (486, 470), (486, 459)], COOL, 2.2)
    arrow(c, [(348, 497), (348, 349), (304, 349), (304, 340)], COOL, 1.6)

    arrow(c, [(156, 181), (177, 181), (177, 224)], DATA, 2.0)
    arrow(c, [(521, 181), (215, 181), (215, 224)], DATA, 2.0)
    label(c, 157, 188, "FIBER A", 4.8, DATA, True)
    label(c, 487, 188, "FIBER B", 4.8, DATA, True)
    arrow(c, [(197, 255), (197, 262), (304, 262), (304, 270)], DATA, 1.7)
    arrow(c, [(197, 255), (197, 350), (304, 350), (304, 355)], DATA, 1.7)
    arrow(c, [(197, 255), (197, 349), (439, 349), (439, 355)], DATA, 1.7)

    c.setStrokeColor(NAVY)
    c.setFillColor(NAVY)
    c.setLineWidth(1.4)
    c.line(559, 505, 559, 524)
    path = c.beginPath()
    path.moveTo(559, 529)
    path.lineTo(554, 521)
    path.lineTo(564, 521)
    path.close()
    c.drawPath(path, stroke=0, fill=1)
    centered(c, 559, 497, "N", 6.5, NAVY, True)

    sx, sy, sw, sh = 596, 151, 168, 382
    c.setFillColor(HexColor("#F7F9FA"))
    c.setStrokeColor(LINE)
    c.roundRect(sx, sy, sw, sh, 6, fill=1, stroke=1)
    label(c, sx + 12, sy + sh - 20, "SYSTEM LEGEND", 7.4, NAVY, True)
    legend = [(POWER, "Power A/B + backup"), (COOL, "Cooling supply / return"), (DATA, "Fiber + data fabric"), (GREEN, "Operations / security"), (HexColor("#8EA0AA"), "Future expansion")]
    ly = sy + sh - 40
    for color, text in legend:
        c.setFillColor(color)
        c.roundRect(sx + 12, ly - 4, 18, 5, 2, fill=1, stroke=0)
        label(c, sx + 37, ly - 4, text, 5.7, INK)
        ly -= 18

    c.setStrokeColor(LINE)
    c.line(sx + 12, ly + 3, sx + sw - 12, ly + 3)
    label(c, sx + 12, ly - 13, "CAPACITY CONCEPT", 7.0, NAVY, True)
    ly -= 32
    capacity = [("12 MW", "2030 first module"), ("15 MW", "2033 conditional step"), ("25 MW", "Uncommitted envelope"), ("PUE 1.20", "Target, not engineered")]
    for value, note in capacity:
        label(c, sx + 12, ly, value, 10, NAVY, True)
        label(c, sx + 67, ly + 1, note, 5.5, MUTED)
        ly -= 24

    c.setStrokeColor(LINE)
    c.line(sx + 12, ly + 6, sx + sw - 12, ly + 6)
    label(c, sx + 12, ly - 10, "ENGINEERING GATES", 7.0, NAVY, True)
    ly -= 27
    gates = ["Peak IT + cooling load sheet", "One-line and protection study", "Post-fault A/B capacity", "UPS minutes + generator kW", "48-hour fuel and cooling duty", "Rack density + liquid/air mix", "Fiber route diversity", "Storage throughput + recovery"]
    for item in gates:
        c.setFillColor(GOLD)
        c.circle(sx + 15, ly + 2, 1.5, fill=1, stroke=0)
        label(c, sx + 22, ly, item, 5.35, INK)
        ly -= 14

    label(c, 28, 132, "FAILURE PATHS AND OPERATING RESPONSE", 7.2, NAVY, True)
    callout(c, 28, 66, 242, "1", "Largest electrical component fails", "Isolate the failed transformer or switchgear section. UPS bridges transfer; surviving A/B capacity protects storage, security and necessary inference. Pause batch work if required.")
    callout(c, 279, 66, 242, "2", "Grid unavailable for 48 hours", "Generators and cooling controls serve the defined critical load. Fuel logistics, emissions, pumps and heat rejection must be proven; full-load operation is not assumed.")
    callout(c, 530, 66, 234, "3", "Capacity cannot carry all GPU work", "Checkpoint and shed interruptible jobs first. Move only eligible work to approved external capacity; restricted data remains in its authorized environment.", GOLD)

    label(c, 28, 42, "Concept design only - not a site survey, architectural plan, stamped single-line, equipment schedule or construction document.", 5.6, MUTED)
    c.setStrokeColor(GOLD)
    c.setLineWidth(1.8)
    c.line(28, 32, width - 28, 32)
    label(c, width - 116, 42, "Prepared 5 October 2026", 5.6, MUTED)
    c.save()


if __name__ == "__main__":
    build()
