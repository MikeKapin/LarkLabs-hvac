"""
SEO Optimization Script for LarkLabs.org
Updates AI tool pages with proper SEO tags and changes Mike Kapin to LARK Labs
"""

import os
import re
from pathlib import Path

def update_homepage():
    """Update homepage with AI tools section and enhanced SEO"""
    file_path = "index.html"

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update title
    content = re.sub(
        r'<title>.*?</title>',
        '<title>LarkLabs - Gas Trade Training | AI Exam Simulators, HVAC Jack & Gas Tech Tutor</title>',
        content,
        flags=re.DOTALL
    )

    # Update meta description
    content = re.sub(
        r'<meta name="description" content=".*?"',
        '<meta name="description" content="Professional gas trade training with AI-powered tools: G2/G3 Exam Simulators, HVAC Jack 4.0 troubleshooting, Code Compass, and Gas Tech Tutor using Claude AI technology."',
        content
    )

    # Update keywords
    content = re.sub(
        r'<meta name="keywords" content=".*?"',
        '<meta name="keywords" content="G3 exam simulator, G2 exam simulator, HVAC troubleshooting AI, Gas Tech Tutor, Code Compass, Claude AI, gas trade training, AI-powered exam prep, Anthropic API, HVAC diagnostics"',
        content
    )

    # Update Mike Kapin to LARK Labs
    content = content.replace('Mike Kapin - Founder of LARK Labs', 'LARK Labs Team')
    content = content.replace('Mike Kapin', 'LARK Labs')

    # Add AI tools mention in footer
    footer_addition = '''
            <div style="text-align: center; padding: 1.5rem 0; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 1.5rem;">
                <p style="color: #3498db; margin-bottom: 0.5rem; font-size: 0.95rem;">
                    🤖 AI-Powered Tools: G3 Simulator • G2 Simulator • HVAC Jack 4.0 • Code Compass • Gas Tech Tutor
                </p>
                <p style="color: #7f8c8d; font-size: 0.85rem; margin: 0;">
                    Powered by Anthropic Claude API
                </p>
            </div>
'''

    # Insert before closing footer div
    content = content.replace(
        '<div class="social-links">',
        footer_addition + '\n            <div class="social-links">'
    )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("DONE: Updated homepage")

def update_gas_tech_tutor():
    """Update Gas Tech Tutor page"""
    file_path = "canadian-gas-technician-ai-tutor.html"

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update title
    content = re.sub(
        r'<title>.*?</title>',
        '<title>Gas Tech Tutor - Fully AI-Integrated Learning Assistant | LarkLabs</title>',
        content,
        flags=re.DOTALL
    )

    # Add meta description if not exists
    if 'name="description"' not in content:
        head_tag = content.find('</head>')
        if head_tag > 0:
            meta_desc = '''    <meta name="description" content="Gas Tech Tutor: Fully AI-integrated learning assistant powered by Claude AI. Get instant answers, explanations, and personalized tutoring for gas technology questions.">
    <meta name="keywords" content="Gas Tech Tutor, AI tutor, Claude AI, gas technician training, AI learning assistant, Anthropic API, HVAC training">
'''
            content = content[:head_tag] + meta_desc + content[head_tag:]

    # Update Mike Kapin references
    content = content.replace('Mike Kapin', 'LARK Labs')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("DONE: Updated Gas Tech Tutor page")

def update_hvac_jack():
    """Update HVAC Jack 4.0 page"""
    file_path = "hvac-jack-40.html"

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update title
    content = re.sub(
        r'<title>.*?</title>',
        '<title>HVAC Jack 4.0 - AI-Powered Troubleshooting Assistant | LarkLabs</title>',
        content,
        flags=re.DOTALL
    )

    # Add meta description
    if 'name="description"' not in content:
        head_tag = content.find('</head>')
        if head_tag > 0:
            meta_desc = '''    <meta name="description" content="HVAC Jack 4.0: AI-powered troubleshooting assistant for HVAC diagnostics. Intelligent problem-solving using Claude AI technology for faster repairs.">
    <meta name="keywords" content="HVAC Jack, AI troubleshooting, HVAC diagnostics, Claude AI, AI-powered HVAC, intelligent diagnostics">
'''
            content = content[:head_tag] + meta_desc + content[head_tag:]

    # Update Mike Kapin references
    content = content.replace('Mike Kapin', 'LARK Labs')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("DONE: Updated HVAC Jack 4.0 page")

def update_code_compass():
    """Update Code Compass page"""
    file_path = "code-compass.html"

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update title
    content = re.sub(
        r'<title>.*?</title>',
        '<title>Code Compass - AI-Integrated Code Reference Tool | LarkLabs</title>',
        content,
        flags=re.DOTALL
    )

    # Add meta description
    if 'name="description"' not in content:
        head_tag = content.find('</head>')
        if head_tag > 0:
            meta_desc = '''    <meta name="description" content="Code Compass: AI-integrated tool for navigating gas codes and regulations. Find relevant code sections faster with intelligent search powered by Claude AI.">
    <meta name="keywords" content="Code Compass, AI code search, gas codes, CSA B149, intelligent code navigation, Claude AI">
'''
            content = content[:head_tag] + meta_desc + content[head_tag:]

    # Update Mike Kapin references
    content = content.replace('Mike Kapin', 'LARK Labs')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("DONE: Updated Code Compass page")

def update_g3_simulator():
    """Update G3 Simulator page"""
    file_path = "g3-practice-tests.html"

    if not os.path.exists(file_path):
        print("WARNING: G3 practice tests file not found")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update title
    content = re.sub(
        r'<title>.*?</title>',
        '<title>G3 Exam Simulator - AI-Enhanced Practice Tests | LarkLabs</title>',
        content,
        flags=re.DOTALL
    )

    # Add meta description
    if 'name="description"' not in content:
        head_tag = content.find('</head>')
        if head_tag > 0:
            meta_desc = '''    <meta name="description" content="AI-enhanced G3 exam simulator for gas technician certification. Practice with intelligent feedback and adaptive testing powered by Claude AI technology.">
    <meta name="keywords" content="G3 exam simulator, AI exam prep, gas technician certification, Claude AI, adaptive testing">
'''
            content = content[:head_tag] + meta_desc + content[head_tag:]

    # Update Mike Kapin references
    content = content.replace('Mike Kapin', 'LARK Labs')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("DONE: Updated G3 Simulator page")

def update_g2_simulator():
    """Update G2 Simulator page"""
    file_path = "g2-practice-tests.html"

    if not os.path.exists(file_path):
        print("WARNING: G2 practice tests file not found")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update title
    content = re.sub(
        r'<title>.*?</title>',
        '<title>G2 Exam Simulator - AI-Enhanced Practice Tests | LarkLabs</title>',
        content,
        flags=re.DOTALL
    )

    # Add meta description
    if 'name="description"' not in content:
        head_tag = content.find('</head>')
        if head_tag > 0:
            meta_desc = '''    <meta name="description" content="AI-enhanced G2 exam simulator for gas technician certification. Advanced practice tests with intelligent feedback powered by Claude AI.">
    <meta name="keywords" content="G2 exam simulator, AI exam prep, gas technician certification, Claude AI, intelligent assessment">
'''
            content = content[:head_tag] + meta_desc + content[head_tag:]

    # Update Mike Kapin references
    content = content.replace('Mike Kapin', 'LARK Labs')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("DONE: Updated G2 Simulator page")

def main():
    """Run all updates"""
    print("Starting SEO optimization...")
    print()

    update_homepage()
    update_gas_tech_tutor()
    update_hvac_jack()
    update_code_compass()
    update_g3_simulator()
    update_g2_simulator()

    print()
    print("All SEO updates complete!")

if __name__ == "__main__":
    main()
