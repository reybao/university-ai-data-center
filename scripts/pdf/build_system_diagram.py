from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import landscape, letter
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "public" / "downloads" / "datacenter-concept-system-diagram.pdf"

NAVY = HexColor("#173A62")
BLUE = HexColor("#315C7A")
GOLD = HexColor("#B99159")
PALE = HexColor("#EEF4F7")
LIGHT = HexColor("#F8FAFB")
LINE = HexColor("#CAD8E1")
TEXT = HexColor("#29485F")
MUTED = HexColor("#60788A")
RED = HexColor("#9A4A35")
WHITE = HexColor("#FFFFFF")


def wrap(text: str, font: str, size: float, max_width: float) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = word if not current else f"{current} {word}"
        if stringWidth(candidate, font, size) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def box(c: canvas.Canvas, x: float, y: float, w: float, h: float, title: str, note: str, fill=WHITE):
    c.setFillColor(fill)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.8)
    c.roundRect(x, y, w, h, 5, fill=1, stroke=1)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 8.5)
    title_lines = wrap(title, "Helvetica-Bold", 8.5, w - 14)[:2]
    ty = y + h - 15
    for line in title_lines:
        c.drawString(x + 7, ty, line)
        ty -= 10
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 6.7)
    for line in wrap(note, "Helvetica", 6.7, w - 14)[:3]:
        c.drawString(x + 7, ty - 2, line)
        ty -= 8


def arrow(c: canvas.Canvas, x1: float, y: float, x2: float):
    c.setStrokeColor(GOLD)
    c.setFillColor(GOLD)
    c.setLineWidth(1.4)
    c.line(x1, y, x2 - 5, y)
    c.line(x2 - 5, y, x2 - 10, y + 3)
    c.line(x2 - 5, y, x2 - 10, y - 3)


def lane(c: canvas.Canvas, y: float, label: str, nodes: list[tuple[str, str]], accent_index: int | None = None):
    left = 40
    label_w = 88
    x0 = left + label_w + 12
    usable = 712 - x0
    gap = 16
    node_w = (usable - gap * (len(nodes) - 1)) / len(nodes)
    h = 56

    c.setFillColor(NAVY)
    c.roundRect(left, y, label_w, h, 5, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 8)
    label_lines = label.split(" & ")
    ly = y + 34
    for i, line in enumerate(label_lines):
        suffix = " &" if i == 0 and len(label_lines) > 1 else ""
        c.drawCentredString(left + label_w / 2, ly, line + suffix)
        ly -= 11

    positions = []
    for idx, (title, note) in enumerate(nodes):
        x = x0 + idx * (node_w + gap)
        positions.append(x)
        box(c, x, y, node_w, h, title, note, PALE if idx == accent_index else WHITE)
    for idx in range(len(positions) - 1):
        arrow(c, positions[idx] + node_w + 2, y + h / 2, positions[idx + 1] - 2)


def fault_panel(c: canvas.Canvas, x: float, y: float, w: float, title: str, action: str):
    c.setFillColor(LIGHT)
    c.setStrokeColor(GOLD)
    c.setLineWidth(1.2)
    c.roundRect(x, y, w, 72, 5, fill=1, stroke=1)
    c.setFillColor(RED)
    c.setFont("Helvetica-Bold", 7)
    c.drawString(x + 10, y + 56, "FAULT CASE")
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(x + 10, y + 41, title)
    c.setFillColor(TEXT)
    c.setFont("Helvetica", 7.1)
    ty = y + 28
    for line in wrap(action, "Helvetica", 7.1, w - 20)[:4]:
        c.drawString(x + 10, ty, line)
        ty -= 9


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=landscape(letter))
    c.setTitle("25 MW AI Data Center - Concept System Architecture")
    c.setAuthor("University Consortium AI Data Center Study")
    c.setSubject("Power, cooling, network, storage and failure paths")
    width, height = landscape(letter)

    c.setFillColor(WHITE)
    c.rect(0, 0, width, height, fill=1, stroke=0)
    c.setFillColor(NAVY)
    c.rect(0, height - 84, width, 84, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(40, height - 26, "ONE-PAGE CONCEPT SYSTEM DIAGRAM")
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(40, height - 50, "25 MW AI Data Center - Concept System Architecture")
    c.setFont("Helvetica", 8)
    c.drawString(40, height - 66, "Power | cooling | network and data | largest-component fault | 48-hour outage")
    c.setFont("Helvetica", 8)
    c.drawRightString(width - 40, height - 28, "Planning envelope: 25 MW facility input")
    c.drawRightString(width - 40, height - 42, "Assignment baseline: 20 MW IT at PUE 1.25")
    c.drawRightString(width - 40, height - 56, "Preferred staged case: 12 MW -> 15 MW")

    lane(c, 433, "POWER & COMPUTE", [
        ("Grid intake", "Available MW, voltage and delivery date TBD"),
        ("Sectionalized MV switchgear", "Protection and common-mode fault study TBD"),
        ("Transformers / distribution A+B", "Largest-unit and post-fault MW TBD"),
        ("UPS A+B / bypass", "Ride-through minutes and battery duty TBD"),
        ("Rack PDU / IT load", "GPU, CPU, storage and network priority tiers"),
    ], 2)

    c.setFillColor(PALE)
    c.setStrokeColor(LINE)
    c.roundRect(140, 399, 572, 24, 4, fill=1, stroke=1)
    c.setFillColor(TEXT)
    c.setFont("Helvetica-Bold", 7.2)
    c.drawString(150, 408, "Backup path: generators + transfer controls -> MV switchgear | critical-load kW, start time, emissions and 48-hour fuel logistics TBD")

    lane(c, 327, "COOLING & HEAT", [
        ("Rack heat pickup", "Direct liquid plus managed air fractions TBD"),
        ("CDUs, pumps and controls", "Redundancy, valves and control power TBD"),
        ("Chiller / dry cooler", "Climate, water and economizer fit TBD"),
        ("Heat rejection", "Backup-power duty and permits TBD"),
    ], 1)

    lane(c, 251, "NETWORK & DATA", [
        ("Campus WAN + diverse fiber", "Capacity, latency and route separation TBD"),
        ("Edge security zones", "Identity, firewall and restricted enclave"),
        ("Compute fabric", "Redundant spine/leaf and management plane TBD"),
        ("Storage fabric", "Capacity, throughput, replication and recovery TBD"),
        ("GPU / CPU / storage racks", "Workload placement by permission and priority"),
    ], 1)

    c.setFillColor(BLUE)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(40, 220, "FAILURE PATHS AND OPERATING RESPONSE")
    fault_panel(c, 40, 137, 350, "Largest transformer or switchgear segment fails",
                "UPS bridges switching only. Preserve storage, security and necessary inference; checkpoint and pause batch work if the surviving path cannot carry all load. Full 25 MW after one fault is not yet proven.")
    fault_panel(c, 402, 137, 350, "Grid unavailable for 48 hours",
                "Generators, fuel delivery and cooling controls support the defined critical load. Stop interruptible batch work and shift only approved workloads externally. Full-load 48-hour operation is not claimed.")

    c.setFillColor(NAVY)
    c.roundRect(40, 68, 712, 52, 5, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(52, 104, "ENGINEERING GATE BEFORE CAPITAL APPROVAL")
    c.setFillColor(WHITE)
    c.setFont("Helvetica", 7.2)
    gate = ("Obtain a peak IT/cooling load sheet; one-line electrical study; largest-unit and post-fault capacity; UPS minutes; generator critical kW and fuel plan; "
            "rack liquid/air mix; water and heat-rejection study; diverse WAN/fabric topology; protection coordination; commissioning and recovery procedures.")
    gy = 90
    for line in wrap(gate, "Helvetica", 7.2, 687)[:3]:
        c.drawString(52, gy, line)
        gy -= 9

    c.setFillColor(MUTED)
    c.setFont("Helvetica", 6.8)
    c.drawString(40, 42, "Concept design only - not a stamped electrical single-line, construction document, utility commitment or final bill of materials.")
    c.drawRightString(width - 40, 42, "Prepared 5 October 2026")
    c.setStrokeColor(GOLD)
    c.setLineWidth(2)
    c.line(40, 32, width - 40, 32)
    c.save()


if __name__ == "__main__":
    build()
