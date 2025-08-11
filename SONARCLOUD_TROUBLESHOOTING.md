# 🔧 SonarCloud Troubleshooting Guide

## ❌ Problema: GitHub Action falhou

Se você está vendo erros no GitHub Actions relacionados ao SonarCloud, este guia ajudará a resolver.

## 🐛 Erros Comuns

### 1. "SONAR_TOKEN is not configured" ou token vazio

**Erro típico:**
```
ERROR Failed to query JRE metadata: . Please check the property sonar.token or the environment variable SONAR_TOKEN.
Warning: Running this GitHub Action without SONAR_TOKEN is not recommended
```

**✅ Solução:**

1. **Acesse SonarCloud**:
   - Vá para: https://sonarcloud.io/account/security
   - Faça login com sua conta GitHub

2. **Gere um novo token**:
   - Click em "Generate Tokens"
   - Nome: `HC-Lisp CI`
   - Expiration: `No expiration` ou `90 days`
   - Copy o token gerado

3. **Configure no GitHub**:
   - Vá para: https://github.com/HectorIFC/hc-lisp/settings/secrets/actions
   - Click "New repository secret"
   - Name: `SONAR_TOKEN`
   - Value: cole o token copiado
   - Click "Add secret"

4. **Teste a configuração**:
   ```bash
   # Execute um novo commit para testar
   git commit --allow-empty -m "test: trigger SonarCloud analysis"
   git push origin master
   ```

### 2. "Action is deprecated" Warning

**Warning típico:**
```
Warning: This action is deprecated and will be removed in a future release. Please use the sonarqube-scan-action action instead.
```

**✅ Solução:**
Este warning foi corrigido! O workflow agora usa:
- `SonarSource/sonarqube-scan-action@v5` (atualizado)
- `sonarqube-quality-gate-action@v1.3.0` (versão estável)

### 3. "Project not found" ou "Authentication failed"

**Erro típico:**
```
ERROR: Error during SonarScanner execution
ERROR: Project 'HectorIFC_hc-lisp' not found
```

**✅ Solução:**

1. **Verifique o projeto no SonarCloud**:
   - Acesse: https://sonarcloud.io/projects
   - Procure por: `hc-lisp` ou `HectorIFC_hc-lisp`

2. **Se o projeto não existe**:
   ```bash
   # Execute o setup novamente
   npm run sonarcloud:setup
   ```

3. **Importe o projeto manualmente**:
   - Vá para: https://sonarcloud.io/projects/create
   - Click "Import project from GitHub"
   - Selecione: `HectorIFC/hc-lisp`
   - Project key deve ser: `HectorIFC_hc-lisp`

### 4. "Organization not found"

**Erro típico:**
```
ERROR: Organization 'hectorifc' does not exist
```

**✅ Solução:**

1. **Verifique sua organização SonarCloud**:
   - Acesse: https://sonarcloud.io/account/organizations
   - Anote o nome exato da organização

2. **Atualize o sonar-project.properties**:
   ```properties
   sonar.organization=SEU_ORG_NAME_AQUI
   ```

## 🔍 Verificação Passo a Passo

### 1. Verificar configuração local
```bash
# Verificar arquivos de configuração
npm run sonarcloud:verify

# Testar geração de coverage
npm run sonarcloud:test
```

### 2. Verificar configuração no GitHub

**Secrets configurados:**
- Vá para: https://github.com/HectorIFC/hc-lisp/settings/secrets/actions
- Deve ter: `SONAR_TOKEN` configurado

**Workflows ativos:**
- Vá para: https://github.com/HectorIFC/hc-lisp/actions
- Verifique se o workflow "SonarCloud Analysis" aparece

### 3. Verificar configuração no SonarCloud

**Projeto importado:**
- Acesse: https://sonarcloud.io/projects
- Procure: `hc-lisp` ou `HectorIFC_hc-lisp`

**Token ativo:**
- Acesse: https://sonarcloud.io/account/security
- Verifique se o token existe e não expirou

## 🚀 Teste Completo

Após corrigir os problemas, teste com:

```bash
# 1. Commit vazio para trigger
git commit --allow-empty -m "test: SonarCloud integration"
git push origin master

# 2. Verificar execução
# - GitHub Actions: https://github.com/HectorIFC/hc-lisp/actions
# - SonarCloud: https://sonarcloud.io/project/overview?id=HectorIFC_hc-lisp
```

## 📞 Se ainda não funcionar

### Logs úteis para debug:

1. **GitHub Actions logs**:
   - Vá para o workflow que falhou
   - Expanda cada step para ver logs detalhados

2. **Verificar configuração**:
   ```bash
   # Ver configuração atual
   cat sonar-project.properties
   
   # Verificar se coverage é gerado
   npm run coverage:sonar
   ls -la coverage/lcov.info
   ```

3. **Teste manual do SonarScanner**:
   ```bash
   # Se tiver sonar-scanner instalado localmente
   sonar-scanner -Dsonar.host.url=https://sonarcloud.io -Dsonar.login=SEU_TOKEN
   ```

## ✅ Checklist de Solução

- [ ] ✅ SONAR_TOKEN configurado no GitHub Secrets
- [ ] ✅ Projeto importado no SonarCloud
- [ ] ✅ Organization name correto em sonar-project.properties
- [ ] ✅ Workflow atualizado (sem actions deprecadas)
- [ ] ✅ Coverage LCOV sendo gerado (npm run coverage:sonar)
- [ ] ✅ Teste realizado com commit

## 🎯 Resultado Esperado

Após a correção, você deve ver:

1. **GitHub Actions**: ✅ Workflow "SonarCloud Analysis" passa
2. **SonarCloud**: Dashboard com métricas atualizadas
3. **PRs**: Comentários automáticos com análise

**🔗 Links de verificação:**
- **Actions**: https://github.com/HectorIFC/hc-lisp/actions
- **SonarCloud**: https://sonarcloud.io/project/overview?id=HectorIFC_hc-lisp
