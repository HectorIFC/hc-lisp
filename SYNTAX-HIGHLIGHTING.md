# Configuração do VS Code para HC-Lisp

## Syntax Highlighting

Para obter syntax highlighting adequado para arquivos `.hc` no VS Code:

### Método 1: Configuração Automática (Recomendado)

1. A extensão "Lisp" já foi instalada automaticamente no workspace
2. As configurações em `.vscode/settings.json` já associam arquivos `.hc` à linguagem Lisp
3. Reinicie o VS Code ou recarregue a janela (`Ctrl+Shift+P` → "Developer: Reload Window")

### Método 2: Configuração Manual

1. Abra um arquivo `.hc`
2. Pressione `Ctrl+Shift+P` (ou `Cmd+Shift+P` no Mac)
3. Digite "Change Language Mode" e selecione a opção
4. Digite "Lisp" e selecione

### Método 3: Configuração Via Barra de Status

1. Abra um arquivo `.hc`
2. Clique no indicador de linguagem na barra de status (canto inferior direito)
3. Selecione "Lisp" na lista de linguagens

## Recursos de Edição

Com o syntax highlighting configurado, você terá:

- **Cores para diferentes elementos**:
  - Comentários (`;; texto`) em verde/cinza
  - Strings (`"texto"`) em vermelho/laranja
  - Keywords (`:keyword`) em roxo/azul
  - Números (`123`, `45.67`, `1e-10`) em azul
  - Parênteses coloridos para facilitar visualização

- **Indentação automática** configurada para 2 espaços
- **Destaque de parênteses correspondentes**
- **Guias visuais para parênteses**

## Arquivo de Demonstração

Abra o arquivo `demo-syntax.hc` para ver exemplos de como o syntax highlighting deve aparecer.

## Extensões Recomendadas

Além da extensão "Lisp" já instalada, considere instalar:

- **Bracket Pair Colorizer** (já habilitado nas configurações)
- **Rainbow Brackets** para melhor visualização de parênteses aninhados
- **Calva** se você quiser recursos mais avançados similares ao Clojure

## Solução de Problemas

Se o syntax highlighting não estiver funcionando:

1. Verifique se a extensão "Lisp" está instalada
2. Recarregue o VS Code
3. Tente mudar manualmente a linguagem para "Lisp"
4. Verifique se o arquivo `.vscode/settings.json` contém as configurações corretas

## Configurações Personalizadas

Você pode personalizar as cores editando seu tema do VS Code ou usando as configurações de `editor.tokenColorCustomizations` no seu `settings.json` pessoal.
