#!/usr/bin/env python3
"""
Script to add SEO header and footer sections to G2 unit HTML files.
Follows the pattern established in Unit 11.
"""

import re
import sys

# Unit metadata
UNITS = {
    16: {
        'title': 'Gas Absorption Refrigeration',
        'subtitle': 'Gas Fired Refrigerators',
        'chapters': [
            'Operation',
            'Installation Procedures',
            'Maintenance and Servicing'
        ],
        'pdf': 'CSA Unit 16 - Gas Fired Refrigerators - Final.pdf',
        'csa_ref': 'CSA B149.1-25 Section 9 (Refrigeration Appliances)',
        'exam_coverage': '8-12%',
        'study_tips': [
            'Understand absorption refrigeration cycle operation principles',
            'Master flame characteristics and burner adjustments for refrigerators',
            'Learn proper leveling requirements and their critical importance',
            'Study troubleshooting procedures for refrigeration issues',
            'Review safety control functions and testing procedures'
        ]
    },
    17: {
        'title': 'Converting Appliances',
        'subtitle': 'Conversion Burners',
        'chapters': [
            'Guidelines for Converting Appliances',
            'Preparation for Conversion',
            'Burner Installation and Flue Gas Analysis'
        ],
        'pdf': 'CSA Unit 17- Conversion Burners - Final.pdf',
        'csa_ref': 'CSA B149.1-25 Section 10 (Appliance Conversions)',
        'exam_coverage': '10-14%',
        'study_tips': [
            'Master conversion code requirements and when conversions are permitted',
            'Understand burner sizing calculations for conversion applications',
            'Learn combustion analysis procedures and acceptance criteria',
            'Study draft requirements for various appliance types',
            'Review post-conversion testing and documentation procedures'
        ]
    },
    18: {
        'title': 'Water Heaters',
        'subtitle': 'Water Heaters and Combination Systems',
        'chapters': [
            'Water Heaters',
            'Combination Systems',
            'Systems Sizing',
            'Servicing Systems'
        ],
        'pdf': 'CSA Unit 18 -Water-Heaters-and-Combination-Systems.pdf',
        'csa_ref': 'CSA B149.1-25 Section 9 (Water Heating Appliances)',
        'exam_coverage': '15-18%',
        'study_tips': [
            'Understand differences between tank and tankless water heater types',
            'Master temperature and pressure relief valve requirements',
            'Learn water heater sizing calculations for various applications',
            'Study combination heating and DHW system designs',
            'Review troubleshooting procedures for common water heater issues'
        ]
    },
    19: {
        'title': 'Forced-air Furnaces',
        'subtitle': 'Forced Warm Air Appliances',
        'chapters': [
            'Forced-air Furnaces',
            'Servicing of Mechanical Components',
            'Electrical Circuits and Components'
        ],
        'pdf': 'CSA Unit 19 - Forced warm air appliances - Final.pdf',
        'csa_ref': 'CSA B149.1-25 Section 9 (Forced Air Heating Appliances)',
        'exam_coverage': '20-25%',
        'study_tips': [
            'Master furnace types: conventional, condensing, and mid-efficiency models',
            'Learn heat exchanger inspection techniques and failure modes',
            'Understand blower motor troubleshooting and airflow requirements',
            'Study furnace control sequences and electrical circuits',
            'Review airflow calculations and duct system requirements'
        ]
    },
    20: {
        'title': 'Boilers and Hydronic Systems',
        'subtitle': 'Hydronic Heating Systems',
        'chapters': [
            'Boilers',
            'Distribution and Control Systems',
            'Circulators',
            'Hydronic Control System Servicing',
            'Pool Heating Systems'
        ],
        'pdf': 'CSA Unit 20 -Hydronic-Heating-Systems - Final.pdf',
        'csa_ref': 'CSA B149.1-25 Section 9 (Hydronic Heating Appliances)',
        'exam_coverage': '18-22%',
        'study_tips': [
            'Understand boiler types and their operation principles',
            'Master hydronic distribution system design and components',
            'Learn circulator sizing and selection procedures',
            'Study zone control systems and their applications',
            'Review expansion tank sizing and pool heater requirements'
        ]
    }
}

def create_header_section(unit_num):
    """Generate SEO header section HTML for a unit."""
    unit = UNITS[unit_num]
    prev_unit = unit_num - 1
    next_unit = unit_num + 1

    chapters_html = '\n'.join([
        f'                    <li><strong>Chapter {i+1}:</strong> {ch} - {unit["chapters"][i].replace(ch, "").strip()}</li>'
        if i == 0 else f'                    <li><strong>Chapter {i+1}:</strong> {ch}</li>'
        for i, ch in enumerate(unit['chapters'])
    ])

    study_tips_html = '\n'.join([
        f'                    <li>{tip}</li>'
        for tip in unit['study_tips']
    ])

    return f'''        <!-- SEO-OPTIMIZED UNIT HEADER SECTION -->
        <!-- ============================================ -->
        <div class="unit-header-section">
            <!-- Breadcrumb Navigation -->
            <nav aria-label="breadcrumb" class="breadcrumb-nav">
                <a href="/">Home</a> &gt;
                <a href="/tssa-g2-exam-prep.html">TSSA G2 Exam Prep</a> &gt;
                <span>Gas Trade Unit {unit_num}: {unit['title']}</span>
            </nav>

            <!-- Training Navigation Menu -->
            <nav class="training-nav" aria-label="Training navigation">
                <a href="/">🏠 Home</a>
                <a href="/tssa-g3-exam-prep.html">📚 G3 Prep</a>
                <a href="/tssa-g2-exam-prep.html">📘 G2 Prep</a>
                <a href="/tssa-g2-units-index.html">📑 All G2 Units</a>
                <a href="/csa-code-search.html">🔍 Code Search</a>
            </nav>

            <!-- Unit Title and Introduction -->
            <h1>Gas Trade Unit {unit_num}: {unit['title']}</h1>
            <h2 class="unit-subtitle">TSSA G2 Certification - Practice Questions & Chapter Reviews</h2>

            <!-- Certification Level Badge -->
            <div class="certification-badge" style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-left: 5px solid #2196f3;">
                <strong>📋 Certification Level:</strong> TSSA G2 (Gas Technician 2 - Intermediate)
            </div>
            <div class="certification-badge" style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border-left: 5px solid #ff9800;">
                <strong>⚠️ Prerequisites:</strong> G3 Certification + 2 Years (4,000 hours) Experience
            </div>

            <!-- Introduction Text -->
            <p class="lead-text">
                Master Gas Trade Unit {unit_num} with free CSA B149.1-25 compliant practice questions for the TSSA G2 certification exam. This unit covers {unit['title'].lower()} topics required for advanced G2 work authorization.
            </p>

            <!-- Unit Coverage -->
            <div class="unit-coverage-box">
                <h3>📖 What This Unit Covers</h3>
                <p>Gas Trade Unit {unit_num} focuses on {unit['title'].lower()} fundamentals:</p>
                <ul class="chapter-list">
{chapters_html}
                </ul>
            </div>

            <!-- TSSA Exam Relevance -->
            <div class="exam-relevance-box">
                <h3>🎯 TSSA G2 Exam Relevance</h3>
                <p><strong>CSA Code Reference:</strong> {unit['csa_ref']}</p>
                <p><strong>Exam Coverage:</strong> {unit['title']} topics appear in approximately {unit['exam_coverage']} of G2 exam questions.</p>
            </div>

            <!-- Study Tips -->
            <div class="study-tips-box">
                <h3>💡 Study Tips for Unit {unit_num}</h3>
                <ul>
{study_tips_html}
                </ul>
            </div>
        </div>
        <!-- ============================================ -->
        <!-- END UNIT HEADER SECTION -->
        <!-- ============================================ -->'''

def create_footer_section(unit_num):
    """Generate SEO footer section HTML for a unit."""
    unit = UNITS[unit_num]
    prev_unit = unit_num - 1
    next_unit = unit_num + 1

    if unit_num == 16:
        prev_link = '/CSA_Unit_15_Chapter_Reviews.html'
        prev_title = 'Unit 15: Domestic Appliances (G2)'
    else:
        prev_link = f'/CSA_Unit_{prev_unit}_Chapter_Reviews.html'
        prev_title = f'Unit {prev_unit}: {UNITS.get(prev_unit, {}).get("title", "")} (G2)'

    if unit_num == 20:
        next_link = '/training/g2/G2/CSA_Unit_21_Chapter_Reviews.html'
        next_title = 'Unit 21: (G2 Continued)'
    else:
        next_link = f'/training/g2/G2/CSA_Unit_{next_unit}_Chapter_Reviews.html'
        next_title = f'Unit {next_unit}: (G2 Continued)'

    return f'''    <!-- SEO-OPTIMIZED UNIT FOOTER SECTION -->
    <!-- ============================================ -->
    <div class="unit-footer-sections">
        <!-- Related Units Section -->
        <section class="related-units">
            <h3>📖 Related Gas Trade Training Units</h3>
            <div class="related-units-grid">
                <!-- Previous Unit -->
                <div class="related-unit-card">
                    <h4>← Previous Unit</h4>
                    <a href="{prev_link}">{prev_title}</a>
                    <p>Review previous G2 unit material</p>
                </div>

                <!-- Next Unit -->
                <div class="related-unit-card">
                    <h4>Next Unit →</h4>
                    <a href="{next_link}">{next_title}</a>
                    <p>Continue your G2 certification journey with the next advanced unit</p>
                </div>

                <!-- Related Unit -->
                <div class="related-unit-card">
                    <h4>🔗 Related</h4>
                    <a href="/tssa-g2-units-index.html">All G2 Units</a>
                    <p>Explore the complete G2 intermediate certification curriculum</p>
                </div>
            </div>
        </section>

        <!-- Next Steps CTA Section -->
        <section class="next-steps">
            <h3>🚀 Next Steps in Your TSSA G2 Preparation</h3>
            <div class="cta-grid">
                <div class="cta-card">
                    <h4>📚 Complete All G2 Units</h4>
                    <p>Work through all G2 units to ensure comprehensive intermediate certification readiness.</p>
                    <a href="/tssa-g2-units-index.html" class="cta-button">View All G2 Units →</a>
                </div>

                <div class="cta-card">
                    <h4>📖 Study CSA B149.1-25 Code</h4>
                    <p>Deep dive into CSA B149.1-25 requirements for G2 level installations.</p>
                    <a href="/csa-code-search.html" class="cta-button">Search CSA Codes →</a>
                </div>

                <div class="cta-card">
                    <h4>🤖 Try AI-Powered Study Tools</h4>
                    <p>Get instant answers to advanced gas technician questions with our AI tutor.</p>
                    <a href="/gas-technician-ai-tutor.html" class="cta-button">Launch AI Tutor →</a>
                </div>
            </div>
        </section>

        <!-- Study Resources Section -->
        <section class="study-resources">
            <h3>📚 Additional G2 Study Resources</h3>
            <ul class="resource-links">
                <li><a href="/training/g2/G2/{unit['pdf']}" target="_blank">📄 Download Unit {unit_num} PDF Study Guide</a></li>
                <li><a href="/tssa-g2-exam-prep.html">← Back to TSSA G2 Exam Prep Overview</a></li>
                <li><a href="/tssa-g2-units-index.html">Browse All G2 Training Units</a></li>
                <li><a href="/tssa-g3-units-index.html">Review G3 Foundation Units</a></li>
                <li><a href="/csa-code-search.html">Search CSA B149.1-25 Code Database</a></li>
                <li><a href="/gas-technician-ai-tutor.html">Ask the AI Tutor Questions</a></li>
                <li><a href="https://www.tssa.org/en/regulated-sectors/fuels/fuels-certification.aspx" target="_blank" rel="noopener">Official TSSA Certification Info</a></li>
            </ul>
        </section>

        <!-- Disclaimer -->
        <div class="disclaimer-box">
            <p><strong>⚠️ Educational Resource Disclaimer:</strong> This practice test is an independent educational resource designed to help students prepare for the TSSA G2 certification exam. These materials are based on CSA B149.1-25 requirements but are not official TSSA materials. G2 certification requires G3 prerequisite plus 2 years (4,000 hours) documented experience. Always refer to the official CSA B149.1-25 code and current TSSA guidelines for authoritative information. LARK Labs is not affiliated with TSSA or CSA Group.</p>
        </div>
    </div>
    <!-- ============================================ -->
    <!-- END UNIT FOOTER SECTION -->
    <!-- ============================================ -->'''

def process_unit_file(unit_num):
    """Add SEO sections to a unit HTML file."""
    filename = f'CSA_Unit_{unit_num}_Chapter_Reviews.html'

    print(f"Processing {filename}...")

    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"  ERROR: File not found")
        return False

    # Check if already processed
    if 'SEO-OPTIMIZED UNIT HEADER SECTION' in content:
        print(f"  Already has SEO sections - skipping")
        return True

    # Find the insertion points
    # Header goes after <div class="container"> and before <div id="mainMenu">
    header_pattern = r'(<div class="container">)\s*(\n\s*<div id="mainMenu">)'
    header_replacement = r'\1\n' + create_header_section(unit_num) + r'\n\2'

    # Footer goes before </body>
    footer_pattern = r'(\s*)(</body>)'
    footer_replacement = r'\n' + create_footer_section(unit_num) + r'\n\2'

    # Apply replacements
    new_content = re.sub(header_pattern, header_replacement, content, count=1)
    new_content = re.sub(footer_pattern, footer_replacement, new_content, count=1)

    # Write back
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"  ✓ SEO sections added")
    return True

if __name__ == '__main__':
    units = [16, 17, 18, 19, 20]

    if len(sys.argv) > 1:
        units = [int(u) for u in sys.argv[1:]]

    print(f"Adding SEO sections to {len(units)} units...")
    print()

    success_count = 0
    for unit_num in units:
        if process_unit_file(unit_num):
            success_count += 1
        print()

    print(f"Completed: {success_count}/{len(units)} units processed successfully")
