# Conventional Commits para HC-Lisp

Este projeto utiliza [Conventional Commits](https://www.conventionalcommits.org/) para padronizar as mensagens de commit e automatizar o versionamento.

## Como fazer commits

Use commits manuais seguindo o formato padrão:

```bash
git commit -m "tipo: descrição breve"
```

### Tipos de commit:

- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Mudanças na documentação
- **style**: Mudanças que não afetam o significado do código (espaços, formatação, etc.)
- **refactor**: Mudança de código que não corrige bug nem adiciona funcionalidade
- **perf**: Mudança de código que melhora performance
- **test**: Adição ou correção de testes
- **chore**: Mudanças nas ferramentas de build, configurações, etc.

### Versionamento automático:

- `feat`: Incrementa versão **minor** (1.0.0 → 1.1.0)
- `fix`: Incrementa versão **patch** (1.0.0 → 1.0.1)
- `feat!` ou `BREAKING CHANGE`: Incrementa versão **major** (1.0.0 → 2.0.0)

## Workflow de Release

1. Faça commits seguindo o formato conventional
2. Faça merge para a branch `master`
3. O GitHub Actions automaticamente:
   - Analisa os commits
   - Determina a nova versão
   - Gera changelog
   - Cria release no GitHub
   - Publica no npm

Não é necessário intervenção manual para versionamento ou publicação!
