# SonarCloud Integration for HC-Lisp

Este documento explica como configurar e usar a integração com SonarCloud para análise contínua de qualidade de código.

## 🌐 O que é SonarCloud?

SonarCloud é uma plataforma de análise de código que fornece:
- **Análise automática** de qualidade de código
- **Métricas de coverage** integradas com CI/CD
- **Detecção de bugs** e vulnerabilidades de segurança
- **Code smells** e problemas de manutenibilidade
- **Quality Gates** para garantir padrões de qualidade

## 🚀 Setup Rápido

### 1. Script de Configuração Automática
```bash
# Executa o setup completo
npm run sonarcloud:setup

# Apenas verificar configuração
npm run sonarcloud:verify

# Apenas testar geração de coverage
npm run sonarcloud:test
```

### 2. Configuração Manual

#### Passo 1: Criar Conta SonarCloud
1. Acesse [SonarCloud.io](https://sonarcloud.io)
2. Faça login com sua conta GitHub
3. Aceite as permissões necessárias

#### Passo 2: Importar Projeto
1. Click em "Import project from GitHub"
2. Selecione o repositório `HectorIFC/hc-lisp`
3. O project key será automaticamente: `HectorIFC_hc-lisp`

#### Passo 3: Gerar Token
1. Vá para [Account Security](https://sonarcloud.io/account/security)
2. Gere um novo token com nome: "HC-Lisp CI"
3. Copie o valor do token

#### Passo 4: Configurar GitHub Secret
1. Vá para [Repository Secrets](https://github.com/HectorIFC/hc-lisp/settings/secrets/actions)
2. Clique em "New repository secret"
3. Nome: `SONAR_TOKEN`
4. Valor: cole o token gerado

## 📊 Como Funciona

### Workflow Automático
- **Push para master**: Executa análise completa
- **Pull Requests**: Análise incremental + comentários automáticos
- **Coverage**: Enviado automaticamente via LCOV
- **Quality Gate**: Verifica se o código atende aos padrões

### Arquivos de Configuração

#### `.github/workflows/sonarcloud.yml`
Workflow do GitHub Actions que:
- Executa testes com coverage
- Envia dados para SonarCloud
- Verifica Quality Gate
- Comenta em PRs com resultados

#### `sonar-project.properties`
Configuração do projeto SonarCloud:
```properties
sonar.projectKey=HectorIFC_hc-lisp
sonar.organization=hectorifc
sonar.sources=src
sonar.tests=tests
sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

## 📈 Métricas Monitoradas

### Code Quality
- **Coverage**: Cobertura de testes
- **Duplications**: Código duplicado
- **Maintainability**: Índice de manutenibilidade
- **Reliability**: Bugs e problemas de confiabilidade
- **Security**: Vulnerabilidades e hotspots

### Quality Gates
Critérios para aprovar código:
- Coverage ≥ 80% em novo código
- Duplicated Lines < 3%
- Maintainability Rating: A
- Reliability Rating: A  
- Security Rating: A

## 🔍 Visualização de Resultados

### Dashboard Principal
- **URL**: https://sonarcloud.io/project/overview?id=HectorIFC_hc-lisp
- **Métricas**: Visão geral de qualidade
- **Trends**: Evolução histórica
- **Issues**: Problemas detectados

### Pull Request Integration
- Comentários automáticos com métricas
- Comparação com branch principal
- Detalhes de coverage incremental
- Quality Gate status

### GitHub Actions
- Status dos workflows em cada commit
- Logs detalhados de análise
- Artefatos de coverage
- Links para resultados SonarCloud

## 🛠️ Comandos Úteis

### Local Development
```bash
# Gerar coverage local para SonarCloud
npm run coverage:sonar

# Verificar configuração
npm run sonarcloud:verify

# Setup completo
npm run sonarcloud:setup
```

### Debugging
```bash
# Verificar arquivo LCOV
ls -la coverage/lcov.info

# Ver conteúdo do coverage
head coverage/lcov.info

# Testar workflow localmente (act)
act -j sonarcloud
```

## 📝 Best Practices

### Para Desenvolvedores
1. **Escreva testes** para manter coverage alto
2. **Revise code smells** antes de fazer push
3. **Corrija security hotspots** imediatamente
4. **Mantenha funções simples** (baixa complexidade)

### Para PRs
1. **Verifique Quality Gate** antes de merge
2. **Aumente coverage** se diminuiu
3. **Resolva issues críticos** detectados
4. **Documente exceções** se necessário

### Para Releases
1. **Zero bugs críticos** antes de release
2. **Coverage ≥ 80%** no código total
3. **Security rating A** obrigatório
4. **Documentar technical debt** pendente

## 🔧 Troubleshooting

### Coverage não aparece
```bash
# Verificar geração local
npm run coverage:sonar
ls -la coverage/lcov.info

# Verificar workflow
cat .github/workflows/sonarcloud.yml | grep lcov
```

### Token inválido
1. Regenerar token no SonarCloud
2. Atualizar secret `SONAR_TOKEN` no GitHub
3. Re-executar workflow

### Quality Gate falhando
1. Verificar métricas no dashboard
2. Corrigir issues críticos
3. Aumentar coverage se necessário
4. Considerar ajustar thresholds (temporariamente)

### Projeto não encontrado
1. Verificar project key: `HectorIFC_hc-lisp`
2. Confirmar organização: `hectorifc`
3. Verificar permissões no SonarCloud

## 🎯 Próximos Passos

### Configuração Avançada
- [ ] Custom Quality Profiles para TypeScript
- [ ] Regras específicas para Lisp interpreters
- [ ] Integration com code review tools
- [ ] Automated security scanning

### Métricas Customizadas
- [ ] Complexity metrics para AST
- [ ] Performance benchmarks
- [ ] Memory usage tracking
- [ ] Parse time analysis

### CI/CD Enhancement
- [ ] Parallel analysis jobs
- [ ] Conditional quality gates
- [ ] Release gates integration
- [ ] Automated issue creation

## 📚 Recursos Adicionais

- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [TypeScript Analysis](https://docs.sonarcloud.io/enriching/languages/javascript/)
- [GitHub Actions Integration](https://docs.sonarcloud.io/advanced-setup/ci-based-analysis/github-actions/)
- [Quality Gates](https://docs.sonarcloud.io/improving/quality-gates/)
