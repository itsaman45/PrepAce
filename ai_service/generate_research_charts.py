import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

# Save images to research_paper_assets folder in project root and artifact directory
output_dirs = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "research_paper_assets")),
    r"C:\Users\mayan\.gemini\antigravity-ide\brain\0f818115-d934-47c5-8086-f4022e0efb92\research_charts"
]

for d in output_dirs:
    os.makedirs(d, exist_ok=True)

# Global Matplotlib Academic Styling Setup for Two-Column IEEE/Springer Paper
plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'Helvetica']
plt.rcParams['axes.edgecolor'] = '#333333'
plt.rcParams['axes.linewidth'] = 0.8
plt.rcParams['grid.color'] = '#e5e7eb'
plt.rcParams['grid.linestyle'] = '--'
plt.rcParams['grid.alpha'] = 0.7

# ---------------------------------------------------------
# Figure 1: Resume Parsing Time Comparison (Human vs PrepAce)
# ---------------------------------------------------------
def generate_fig1_parsing_time():
    fig, ax = plt.subplots(figsize=(6, 4.2), dpi=300)
    
    categories = ['Human / Manual\nParsing', 'PrepAce Automated\nParsing']
    means = [185.40, 6.72]
    colors = ['#475569', '#2563eb']
    
    bars = ax.bar(categories, means, color=colors, 
                  edgecolor='#1e293b', linewidth=1.2, width=0.45, zorder=3)
    
    ax.set_ylabel('Average Parsing Time per Resume (s)', fontsize=10, fontweight='bold', labelpad=8)
    # Headings removed per academic paper standard (captions written in LaTeX)
    ax.set_ylim(0, 230)
    ax.grid(axis='y', zorder=0)
    
    # Annotate mean values cleanly
    for bar, mean in zip(bars, means):
        yval = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2.0, yval + 5, f'{mean:.2f} s', 
                ha='center', va='bottom', fontsize=9.5, fontweight='bold', color='#0f172a')
        
    # Draw bracket & time reduction annotation
    time_reduction = ((185.40 - 6.72) / 185.40) * 100
    ax.annotate(f'Time Reduction: {time_reduction:.1f}%',
                xy=(1, 15), xytext=(0.5, 135),
                arrowprops=dict(arrowstyle='->', lw=1.2, color='#16a34a'),
                fontsize=9, fontweight='bold', color='#15803d',
                ha='center', bbox=dict(boxstyle='round,pad=0.4', facecolor='#f0fdf4', edgecolor='#86efac'))

    plt.tight_layout()
    for d in output_dirs:
        path = os.path.join(d, "fig1_resume_parsing_time_comparison.png")
        plt.savefig(path, dpi=300, bbox_inches='tight')
    plt.close()
    print("Generated Fig 1: Resume Parsing Time Comparison (No Headings)")

# ---------------------------------------------------------
# Figure 2: Entity Extraction Accuracy Across Categories
# ---------------------------------------------------------
def generate_fig2_accuracy_metrics():
    fig, ax = plt.subplots(figsize=(7.5, 4.2), dpi=300)
    
    categories = ['Skills', 'Projects', 'Technologies', 'Languages', 'Experience']
    precision = [0.942, 0.915, 0.950, 0.968, 0.890]
    recall    = [0.920, 0.880, 0.932, 0.955, 0.865]
    f1_score  = [0.931, 0.897, 0.941, 0.961, 0.877]
    
    x = np.arange(len(categories))
    width = 0.25
    
    rects1 = ax.bar(x - width, precision, width, label='Precision', color='#1d4ed8', edgecolor='#1e3a8a', linewidth=1, zorder=3)
    rects2 = ax.bar(x, recall, width, label='Recall', color='#0d9488', edgecolor='#115e59', linewidth=1, zorder=3)
    rects3 = ax.bar(x + width, f1_score, width, label='F1-Score', color='#d97706', edgecolor='#92400e', linewidth=1, zorder=3)
    
    ax.set_ylabel('Score Metric (0.00 – 1.00)', fontsize=10, fontweight='bold', labelpad=8)
    # Headings removed per academic paper standard
    ax.set_xticks(x)
    ax.set_xticklabels(categories, fontsize=9.5, fontweight='bold')
    ax.set_ylim(0.70, 1.05)
    ax.grid(axis='y', zorder=0)
    ax.legend(loc='upper right', frameon=True, facecolor='#ffffff', edgecolor='#cbd5e1', fontsize=8.5)
    
    # Add values on top of F1 bars
    for rect in rects3:
        height = rect.get_height()
        ax.annotate(f'{height:.2f}',
                    xy=(rect.get_x() + rect.get_width() / 2, height),
                    xytext=(0, 3),
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=7.5, fontweight='bold', color='#78350f')

    plt.tight_layout()
    for d in output_dirs:
        path = os.path.join(d, "fig2_entity_extraction_accuracy.png")
        plt.savefig(path, dpi=300, bbox_inches='tight')
    plt.close()
    print("Generated Fig 2: Entity Extraction Accuracy (No Headings)")

# ---------------------------------------------------------
# Figure 3: System Pipeline Latency Breakdown (Horizontal Bar Chart)
# ---------------------------------------------------------
def generate_fig3_pipeline_latency():
    fig, ax = plt.subplots(figsize=(8, 4.5), dpi=300)
    
    stages = [
        'S1. PDF Upload / Transfer',
        'S2. PDF Text Extraction',
        'S3. Resume Info Extraction',
        'S4. LLM Analysis (Groq)',
        'S5. Question Generation',
        'Total Pipeline Latency'
    ]
    latencies = [0.24, 0.42, 1.15, 3.10, 1.81, 6.72]
    colors    = ['#64748b', '#475569', '#0284c7', '#2563eb', '#7c3aed', '#059669']
    
    # Horizontal bars (reversed so S1 is at top, Total at bottom)
    y_pos = np.arange(len(stages))[::-1]
    
    bars = ax.barh(y_pos, latencies, color=colors, edgecolor='#0f172a', 
                   linewidth=1.1, height=0.55, zorder=3)
    
    ax.set_yticks(y_pos)
    ax.set_yticklabels(stages, fontsize=9.5, fontweight='bold')
    ax.set_xlabel('Average Processing Latency (seconds)', fontsize=10, fontweight='bold', labelpad=8)
    # Headings removed per academic paper standard
    ax.set_xlim(0, 7.8)
    ax.grid(axis='x', zorder=0)
    
    # Annotate values to the right of horizontal bars
    for bar, lat in zip(bars, latencies):
        xval = bar.get_width()
        yval = bar.get_y() + bar.get_height() / 2.0
        ax.text(xval + 0.12, yval, f'{lat:.2f} s', 
                ha='left', va='center', fontsize=9, fontweight='bold', color='#1e293b')

    plt.tight_layout()
    for d in output_dirs:
        path = os.path.join(d, "fig3_pipeline_latency_breakdown.png")
        plt.savefig(path, dpi=300, bbox_inches='tight')
    plt.close()
    print("Generated Fig 3: System Pipeline Latency Breakdown (No Headings)")

if __name__ == '__main__':
    generate_fig1_parsing_time()
    generate_fig2_accuracy_metrics()
    generate_fig3_pipeline_latency()
    print("All 3 clean research paper graph PNG images (without headings) regenerated successfully!")
