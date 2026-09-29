# Detection Methodology & Multi-Signal Ensemble

## Detection Models

### 1. Detector A — Rule-Based Baseline
Evaluates percentage increase over a rolling baseline window (e.g. 24 hours):
$$\Delta \% = \frac{\text{Current Cost} - \text{Baseline Cost}}{\text{Baseline Cost}} \times 100$$
Categorizes into WARNING ($\ge 30\%$), HIGH ($\ge 60\%$), and CRITICAL ($\ge 100\%$) subject to a minimum dollar increase constraint (e.g. $\$100/\text{hr}$).

### 2. Detector B — Statistical Detector (Z-Score + EWMA)
Computes historical rolling mean ($\mu$) and standard deviation ($\sigma$):
$$z = \frac{x - \mu}{\sigma}$$
Combined with Exponentially Weighted Moving Average (EWMA, $\alpha = 0.3$) divergence:
$$\text{EWMA}_t = \alpha x_t + (1 - \alpha) \text{EWMA}_{t-1}$$
A sigmoid mapping scales the z-score into a continuous $[0, 1]$ confidence value.

### 3. Detector C — Workload-Aware Elasticity Detector
Evaluates cost elasticity relative to actual application throughput (jobs/hr, active streams):
$$\text{Cost Per Unit} = \frac{\text{Hourly Spend}}{\text{Jobs/Hour}}$$
- If Workload rises $+145\%$ and Cost rises $+155\%$, elasticity ratio is $\sim 1.07$, indicating legitimate scaling (score: $0.15$).
- If Workload rises $+12\%$ and Cost surges $+158\%$, elasticity ratio is $\sim 13.2$, indicating runaway capacity expansion (score: $0.95$).

### 4. Ensemble Composite Anomaly Score
Combines multi-modal signals using weighted harmonic fusion:
$$\text{Composite Score} = 0.20 \cdot S_{\text{rule}} + 0.25 \cdot S_{\text{stat}} + 0.25 \cdot S_{\text{workload}} + 0.15 \cdot S_{\text{resource}} + 0.15 \cdot S_{\text{deployment}}$$
- Severity Thresholds:
  - $\ge 0.82 \implies \text{CRITICAL}$
  - $\ge 0.65 \implies \text{HIGH}$
  - $\ge 0.45 \implies \text{WARNING}$
  - $< 0.45 \implies \text{NORMAL}$
