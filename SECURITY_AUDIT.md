# Configuration de sécurité CI/CD

## État actuel des vulnérabilités

### Production (ce qui compte pour l'application déployée)
✅ **2 vulnérabilités LOW uniquement**
- `quill@2.0.3` : XSS via fonctionnalité d'export HTML
- Risque minimal (n'affecte pas l'utilisation normale)
- Aucun correctif disponible (version la plus récente)

### Développement (outils de test uniquement)
⚠️ **30 vulnérabilités HIGH** dans les dépendances de test Jest
- N'affectent **PAS** l'application en production
- Outils de développement local uniquement
- Jest a des dépendances anciennes dans son écosystème

## Configuration CI/CD recommandée

### GitHub Actions
```yaml
- name: Security audit (production only)
  run: npm run audit:prod
```

### GitLab CI
```yaml
security-audit:
  script:
    - npm run audit:prod
```

### Alternative : audit complet avec seuil
```yaml
# N'échoue que sur vulnérabilités critical en production
- name: Security audit
  run: npm audit --omit=dev --audit-level=critical
```

## Scripts disponibles

```bash
# Audit de production uniquement (recommandé pour CI/CD)
npm run audit:prod

# Audit complet (dev + production)
npm audit

# Audit complet avec seuil high
npm audit --audit-level=high
```

## Pourquoi ignorer les vulnérabilités de dev ?

Les vulnérabilités dans les outils de développement (Jest, ESLint, etc.) :
- Ne sont **jamais** inclus dans le bundle de production
- N'exposent pas l'application déployée à des risques
- Sont exécutés uniquement sur les machines de développement
- Sont difficiles à corriger sans breaking changes majeurs

## Dernière mise à jour
- Next.js : ✅ 15.5.12 (corrige vulnérabilités critiques RCE/DoS)
- Jest : ✅ 30.2.0 (version stable moderne)
- ESLint : ✅ 9.39.3
- Production : ✅ Sécurisée
