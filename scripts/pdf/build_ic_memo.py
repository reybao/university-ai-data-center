from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'public/downloads/university-consortium-ic-memo-2-page.pdf'
NAVY=colors.HexColor('#173A62')
INK=colors.HexColor('#1D2D3C')
MUTED=colors.HexColor('#526579')
LINE=colors.HexColor('#D9E3EA')
PALE=colors.HexColor('#F3F7FA')
GOLD=colors.HexColor('#A2783B')

styles={
 'kicker':ParagraphStyle('kicker',fontName='Helvetica-Bold',fontSize=7.5,leading=10,textColor=GOLD,spaceAfter=5),
 'title':ParagraphStyle('title',fontName='Helvetica-Bold',fontSize=17.5,leading=20.5,textColor=NAVY,spaceAfter=4),
 'subtitle':ParagraphStyle('subtitle',fontName='Helvetica',fontSize=8,leading=10,textColor=MUTED,spaceAfter=10),
 'h':ParagraphStyle('h',fontName='Helvetica-Bold',fontSize=10,leading=12.5,textColor=NAVY,spaceBefore=10,spaceAfter=4),
 'body':ParagraphStyle('body',fontName='Helvetica',fontSize=8.45,leading=11.4,textColor=INK,spaceAfter=4),
 'small':ParagraphStyle('small',fontName='Helvetica',fontSize=7.25,leading=9.6,textColor=MUTED,spaceAfter=2),
 'call':ParagraphStyle('call',fontName='Helvetica',fontSize=9,leading=12.2,textColor=NAVY),
 'th':ParagraphStyle('th',fontName='Helvetica-Bold',fontSize=7,leading=9,textColor=colors.white),
 'td':ParagraphStyle('td',fontName='Helvetica',fontSize=7.45,leading=9.5,textColor=INK),
 'tdb':ParagraphStyle('tdb',fontName='Helvetica-Bold',fontSize=7.45,leading=9.5,textColor=NAVY),
}

def P(s,k='body'): return Paragraph(s,styles[k])
def section(title, text): return [P(title,'h'),P(text)]
def tbl(rows,widths,header=True):
    data=[]
    for i,row in enumerate(rows):
        data.append([P(str(cell),'th' if header and i==0 else ('tdb' if j==0 else 'td')) for j,cell in enumerate(row)])
    t=Table(data,colWidths=widths,repeatRows=1 if header else 0,hAlign='LEFT')
    commands=[('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5),('GRID',(0,0),(-1,-1),0.35,LINE)]
    if header: commands += [('BACKGROUND',(0,0),(-1,0),NAVY),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,PALE])]
    else: commands += [('ROWBACKGROUNDS',(0,0),(-1,-1),[colors.white,PALE])]
    t.setStyle(TableStyle(commands))
    return t

def footer(c,doc):
    c.saveState()
    w,h=letter
    c.setStrokeColor(LINE);c.setLineWidth(.5);c.line(42,34,w-42,34)
    c.setFont('Helvetica',7);c.setFillColor(MUTED)
    c.drawString(42,23,'University Consortium AI/HPC  |  Illustrative planning case  |  5 Oct 2026')
    c.drawRightString(w-42,23,f'{doc.page} / 2')
    c.restoreState()

doc=SimpleDocTemplate(str(OUT),pagesize=letter,rightMargin=42,leftMargin=42,topMargin=39,bottomMargin=46,title='University Consortium AI/HPC - Two-page Investment Committee Memorandum',author='University Consortium AI Data Center Research')
story=[]
# PAGE 1
story += [P('INVESTMENT COMMITTEE MEMORANDUM  /  DECISION SUMMARY','kicker'),P('University Consortium AI/HPC Compute Capacity','title'),P('Decision stage: illustrative 2027-2036 planning case  |  No named consortium, site, supplier quote or capital authorization','subtitle')]
call=tbl([['DECISION REQUESTED'],['Endorse a phased <b>25 MW total facility-input planning envelope</b> and price a controlled colocation core against all-cloud. Model 12 MW at first opening in 2030, 15 MW from 2033; keep 20-25 MW as an uncommitted option. Do not authorize full construction or fleet procurement on this evidence.']],[528])
call.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),NAVY),('BACKGROUND',(0,1),(-1,1),PALE),('BOX',(0,0),(-1,-1),0.6,LINE)]))
story += [call]
story += section('Why and how much','The assignment intentionally defines a fictional five-member alliance, modeled at 3.5 MIT-reference demand units. Its base workload requires approximately <b>13.20 MW facility input in 2030</b> and <b>19.80 MW in 2035</b> if all eligible work is provisioned; high 2035 demand reaches 39.57 MW. These are explicit case assumptions and model outputs. The preferred hybrid places 70% of annual eligible task hours in a controlled core and 30% in eligible cloud capacity.')
story += section('What to buy, and where','Lead with consortium-owned B200/H200/L40S-class capacity in a US controlled colocation environment, plus eligible cloud capacity for transition and overflow. Keep device/campus robotics control local; restricted data moves only with project-specific approval. Compare US regions on electricity price and cost to obtain power at this stage; no parcel or 2030 grid-delivery claim is made.')
story += [P('Cost comparison - 10-year NPV, constant 2026 dollars, 8% real discount','h'),tbl([
 ['Structure','Cost NPV','Decision reading'],
 ['All-cloud public-price proxy','$1.152bn','Lowest modeled base cost; service comparability unverified'],
 ['Hybrid colo, yearly exact sizing','$1.177bn','Optimistic continuous-capacity benchmark'],
 ['Hybrid colo, 12 MW to 15 MW modules','$1.192bn','Preferred structure to price; fixed-capacity downside included'],
 ['Full ownership','$1.219bn','Higher modeled cost; no parcel quote']
],[154,78,296])]
story += [P('Required independent stresses - same demand, tier mix, prices and capacity contract','h'),tbl([
 ['Scenario','Pre-opening cash','2030 ops + cloud','Cost / effective GPU-h','Capital at risk'],
 ['Base','$555.6m','$89.8m','$4.57','$235.5m'],
 ['All grid power delayed 1 year','$751.4m','$175.1m','$4.80','$256.2m'],
 ['GPU utilization half forecast','$632.1m','$125.6m','$5.73','$312.0m']
],[140,96,97,99,96])]
story += [Spacer(1,4),P('<b>Metric basis:</b> Pre-opening cash includes prior spending plus opening-year CAPEX, excluding opening-year OPEX. The annual column is calendar 2030 and includes cloud service. Cost per effective GPU-hour is total 10-year portfolio TCO divided by completed device-occupied GPU hours; classes are not performance-equivalent. Capital at risk is invested CAPEX through opening with zero assumed recovery, an exposure proxy rather than expected loss.','small')]
story += section('Before any capital approval','Treat the recommendation as conditional on the fictional case inputs. A real sponsor would replace them with tier-specific minimum commitments; matched cloud, colo and GPU quotes; full power and access prices; engineered cooling and reliability; data permissions; delay and exit allocations; and financed cash flows. The current $1.192bn is a cost NPV, not an approved financing plan.')
story += [PageBreak()]
# PAGE 2
story += [P('INVESTMENT COMMITTEE MEMORANDUM  /  DECISION CONDITIONS','kicker'),P('Execution, governance and evidence','title'),P('The base case is a pricing and sizing framework. Each gate below requires member or supplier evidence before an irreversible commitment.','subtitle')]
story += [P('Physical design basis and resilience','h'),P('<b>Assignment baseline:</b> 20 MW IT x PUE 1.25 = 25 MW total input. Current model uses PUE 1.20 as an <b>unverified efficiency target</b>, allowing approximately 20.83 MW IT under the same 25 MW ceiling. Achieving it depends on cooling and power-distribution engineering, climate and operating load. PUE alone does not certify peak electrical capacity or redundancy.')]
story += [tbl([
 ['Power path','Grid connection -> sectionalized MV switchgear -> A/B transformers -> A/B UPS and rack distribution. Standby generation connects through transfer/switchgear; ratings and switching sequence need engineering.'],
 ['Heat and network','Air plus high-density liquid/CDU cooling -> heat rejection. Two diverse fiber paths -> security edge -> compute and storage fabrics. Water, pumps, redundancy and route capacity need engineering.'],
 ['Largest component fault','Test loss of the largest transformer or MV section and upstream common points. UPS bridges transfer; generation and cooling sustain defined critical loads. Checkpoint or stop batch GPU jobs if residual capacity is insufficient. Full 25 MW N-1 is unproven.'],
 ['48-hour grid outage','Validate critical-load generation, fuel logistics, emissions and heat rejection for 48 hours. If not demonstrable, shed batch loads and move only cloud-eligible work; protect secure storage and controls. Full-load 48-hour operation is unproven.']
],[130,398],header=False)]
story += [P('Funding and consortium governance - proposed terms, not an adopted agreement','h'),P('Members commit minimum service capacity by GPU tier and fund their reserved equipment and fixed charges. Meter variable power, cloud and storage usage to projects. Hold a <b>separately funded 10% service-hours pool</b> for smaller institutions and teaching; the 90/10 service allocation is distinct from the 70/30 site/cloud workload assumption. An approved reserve bears uncovered delay costs up to a voted cap. Proposed exits require 12 months notice and payment of unamortized dedicated capital plus noncancelable obligations, net of capacity reallocated to another member. Expansion, debt and irreversible capital require member approval; each data owner retains approval over restricted-data moves. Financing, interest, debt service and grants are not in the cost NPV.')]
story += [P('Milestones and investment gates','h'),tbl([
 ['2027','For a real implementation, replace fictional demand assumptions with member commitments; benchmark representative workloads and data permissions.'],
 ['2028-2029','Get comparable cloud, GPU, colo and power-access terms; engineer cooling, single-fault and 48-hour critical-load cases; settle funding rules.'],
 ['2030','Conditional first 12 MW opening only after member commitments, service terms and capital approval. One-year no-grid stress assumes first service in 2031.'],
 ['2033+','Expand to 15 MW only with demand evidence; refresh GPUs in cohorts, typically four-year planning cycle. Reassess 20-25 MW option.']
],[74,454],header=False)]
story += [HRFlowable(width='100%',thickness=.5,color=LINE,spaceBefore=6,spaceAfter=5),P('<b>Evidence and limitations.</b> MIT ORCD GPU-use and resource guidance (2025) anchor task types, not alliance demand. EIA 2024 industrial state prices are historical averages, not project tariffs. NVIDIA DGX technical guides anchor equipment power; Lambda and Runpod public listings anchor mixed-product cloud prices, not a single procurement quote. All demand, utilization, tier split, GPU prices, PUE and opening dates are explicit model assumptions. Research model and detailed calculations: <link href="https://university-ai-data-center.reybao.chatgpt.site" color="#173A62">university-ai-data-center.reybao.chatgpt.site</link> (5 Oct 2026).','small')]
doc.build(story,onFirstPage=footer,onLaterPages=footer)
print(OUT)
