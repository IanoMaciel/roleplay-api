
# Roleplay API

## Sobre o Projeto

Roleplay é um sistema de gerenciamento de mesas de RPG (Role Playing Game, do inglês). Cada mesa é liderada por um mestre, responsável por cadastrar a mesa e estabelecer as regras do jogo. Jogadores interessados podem buscar por uma mesa e solicitar ingresso, aguardando a aprovação do mestre para sua solicitação.

## Requisitos de Software

- [Documentação de Requisitos](https://whimsical.com/requisitos-de-software-BKqDWQNZLs1b5gCjFpuXMg)

## Como Executar

Para executar a API, siga as instruções abaixo:

1. Configure o banco de dados MySQL de acordo com o arquivo `.env`.
2. Clone este repositório utilizando o seguinte comando:

```bash
git clone https://github.com/IanoMaciel/roleplay-api.git
```

3. Entre no diretório do projeto e instale as dependências utilizando `yarn install` ou `npm install`.
4. Em seguida, execute as migrações utilizando o comando:

```bash
node ace migration:run
```

5. Por fim, em seu terminal, execute o comando abaixo para iniciar a aplicação em ambiente de desenvolvimento:

```bash
yarn dev
```

**Nota:** Estou utilizando o gerenciador de pacotes Yarn, mas caso esteja utilizando o npm, utilize `npm install` para subir a aplicação em ambiente de desenvolvimento.
