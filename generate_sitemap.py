"""
Sitemap Generator for LarkLabs.org
Generates sitemap.xml with proper priorities for AI tools and training pages
"""

import os
from datetime import datetime
from pathlib import Path
import html

def get_all_html_files():
    """Get all HTML files in the website"""
    html_files = []

    # Root directory HTML files
    for file in Path('.').glob('*.html'):
        if file.name not in ['index.html', 'UNIT_PAGE_TEMPLATE.html', 'index_backup_original.html', 'index_new_testing.html']:
            html_files.append(str(file))

    # Pages subdirectories
    for file in Path('pages').rglob('*.html'):
        html_files.append(str(file).replace('\\', '/'))

    return html_files

def get_priority(filename):
    """Determine priority based on file type"""
    # AI tools - highest priority
    ai_tools = [
        'canadian-gas-technician-ai-tutor.html',
        'hvac-jack-40.html',
        'code-compass.html',
        'g3-practice-tests.html',
        'g2-practice-tests.html',
        'g3_simulator.html'
    ]

    if filename in ai_tools:
        return '0.9'

    # Training/CSA pages
    if 'CSA_Unit' in filename or 'training' in filename.lower():
        return '0.8'

    # Blog posts
    if 'blog' in filename:
        return '0.7'

    # Other pages
    return '0.6'

def get_changefreq(filename):
    """Determine change frequency based on file type"""
    # AI tools and practice tests - monthly updates
    if any(keyword in filename for keyword in ['tutor', 'jack', 'compass', 'practice', 'simulator']):
        return 'monthly'

    # Training pages - monthly (quarterly is not valid per sitemap protocol)
    if 'CSA_Unit' in filename:
        return 'monthly'

    # Blog - weekly
    if 'blog' in filename:
        return 'weekly'

    # Other
    return 'monthly'

def generate_sitemap():
    """Generate sitemap.xml"""
    base_url = 'https://larklabs.org'
    now = datetime.now().strftime('%Y-%m-%d')

    # Start sitemap
    sitemap = '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
'''

    # Homepage - highest priority
    sitemap += f'''  <url>
    <loc>{base_url}/</loc>
    <lastmod>{now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
'''

    # Get all HTML files
    html_files = get_all_html_files()

    # Sort for consistent ordering
    html_files.sort()

    # Add each page
    for file_path in html_files:
        # Clean up path
        url_path = file_path.replace('\\', '/')

        # Escape special XML characters in URL (&, <, >, ", ')
        url_path_escaped = html.escape(url_path, quote=False)

        # Skip certain files
        if any(skip in file_path for skip in ['backup', 'template', 'test', 'cancel', 'success', 'protected']):
            continue

        filename = os.path.basename(file_path)
        priority = get_priority(filename)
        changefreq = get_changefreq(filename)

        sitemap += f'''  <url>
    <loc>{base_url}/{url_path_escaped}</loc>
    <lastmod>{now}</lastmod>
    <changefreq>{changefreq}</changefreq>
    <priority>{priority}</priority>
  </url>
'''

    # Close sitemap
    sitemap += '</urlset>'

    # Write sitemap
    with open('sitemap.xml', 'w', encoding='utf-8') as f:
        f.write(sitemap)

    print(f"Sitemap generated with {len(html_files) + 1} URLs")
    print("File: sitemap.xml")

if __name__ == "__main__":
    generate_sitemap()
