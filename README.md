# Playbook do SDR · ELORA

Site do playbook comercial do SDR da ELORA Clínica Odontológica. Cada página do site é um arquivo em [`conteudo/`](conteudo).

## Como editar

1. No site, abra a página e clique em **Editar esta página** (é preciso estar logado no GitHub com acesso a este repositório).
2. Mude o texto no editor do GitHub.
3. Clique em **Commit changes**. O site se atualiza sozinho em cerca de 1 minuto.

## Como escrever

- `# Título` da página, `## Seção`, `### Situação`.
- Mensagem pronta para o paciente: uma linha começando com `> "` (ganha o botão **Copiar** no site).
- Conversa de exemplo: linhas começando com `> **Paciente:**` e `> **SDR:**`.
- Tabelas, listas e caixas de seleção (`- [ ]`) funcionam como no Markdown do GitHub.
- Página nova: crie o arquivo em `conteudo/` e acrescente uma linha na lista `PAGINAS` de [`assets/app.js`](assets/app.js).

Esta versão é pública e não traz os números internos da clínica nem a parte de gestão.
