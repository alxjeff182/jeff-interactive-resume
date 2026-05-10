# Performance Baseline

## Build Baseline
- App chunk: 53.64 kB (gzip 16.64 kB)
- Three core chunk: 555.29 kB (gzip 139.80 kB)
- Three loaders chunk: 138.86 kB (gzip 47.26 kB)

## Asset Baseline
- Total GLB models: 201.38 MB
- GLB count: 24
- Largest model: `public/models/props/topiary_star.glb` at 11.00 MB

## Performance Budgets
- Max app chunk: 80 kB
- Max three-core chunk: 580 kB
- Max three-loaders chunk: 170 kB
- Max total models size: 210 MB
- Max single model size: 11.5 MB

Budgets are enforced by running:

`npm run perf:budget`
