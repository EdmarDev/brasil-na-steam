# Brasil na Steam

Uma ferramenta para visualização de dados de jogos brasileiros na Steam.

Este projeto foi desenvolvido como um Trabalho de Conclusão para o curso de Bacharelado em Sistemas de Informação do Instituto Federal de Educação, Ciência e Tecnologia Fluminense.

## Principais tecnologias utilizadas

- [React Router 7](https://reactrouter.com/home)
- [Drizzle](https://orm.drizzle.team/)
- [Mantine](https://mantine.dev/)
- [PosgreSQL](https://www.postgresql.org/)
- [Recharts](https://recharts.org/en-US/)

## Configuração inicial

Instale as dependências:

```bash
npm install
```

Este projeto precisa se conectar a um banco de dados PostgreSQL. Crie um arquivo chamado `.env` e insira a string de conexão do banco de dados da seguinte forma:

```ini
# Substitua com um valor real
DATABASE_URL=postgresql://user:password@localhost:5432/nome_do_banco
```

Utilize o seguinte comando para criar automaticamente as estruturas do banco de dados: (Mais informações em: [drizzle-kit push](https://orm.drizzle.team/docs/drizzle-kit-push))

```bash
npx drizzle-kit push
```

## Inserção de dados iniciais

É possível inserir dados diretamente, providenciando _App IDs_ de jogos com o comando:

```bash
npx tsx scripts/insert-game-ids.ts 2872300 1422420 # Insira outros IDs de jogos aqui...
```

Ou com um arquivo JSON, que deve conter um array de IDs:

```bash
npx tsx scripts/insert-game-ids.ts --file caminho/do/arquivo.json
```

Também é possível inserir nomes de desenvolvedores ou distribuidoras na Steam:

```bash
npx tsx scripts/insert-brazilian-companies.ts "Nuuvem Inc" "Behold Studios" # ...
# OU
npx tsx scripts/insert-brazilian-companies.ts --file caminho/do/arquivo.json
```

E encontrar todos os jogos desenvolvidos/publicados pelas empresas:

```bash
npx tsx scripts/find-games-from-companies.ts
```

Os dados sobre os jogos podem ser coletados utilizando:

```bash
npx tsx scripts/collect-base-data.ts
npx tsx scripts/collect-metrics.ts
```

## Iniciando o servidor de desenvolvimento

Por fim, o servidor pode ser iniciado com o comando:

```bash
npm run dev
```

e acessado no endereço `http://localhost:5173/`
