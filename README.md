# Code Challenge DevOps Kanastra - Diogo Andrade

Este é um desafio para a vaga de DevopsLead. A minha estratégia de solução é:

- fiz um fork a partir do repo original
- Cloud escolhida: primeiramente Google Cloud, e AWS reutilizando o projeto ao máximo, se der tempo
- Ferramentas escolhidas: Pulumi + Typescript, Github Actions, Prettier + ESLint
- Metodologia de design: Todo código typescript será feito com TDD usando jest como framework de teste
- Controle de atividades: Idealmente, eu faria um board no jira com integração entre github para que o ticket tivesse um vínculo para o commit que gerou uma build bem sucedida. Mas para economizar tempo, o controle será por esse readme mesmo, onde o commit de cada etapa terá um link no próprio texto
- Tagging: Cada etapa (Provisionamento, CI/CD, Aplicação) terá uma tag correspondente MVP_prov, MVP_pipe, MVP_app, coisas bonus serão planejadas e adicionadas após o MVP estar pronto e estar sobrando prazo para a entrega
- Organização: Cada aspecto da solução tem sua pasta separada, com separação de manifestos e configurações de ambientes de dev e prod quando pertinente. Não vou criar configurações extra para staging, pois este deve ser a simulação mais fiel do ambiente de produção, apenas com segredos, tokens, usuarios, etc diferentes
- Ambiente de desenvolvimento: o Dockerfile na raiz permite testar o projeto sem necessidade de instalar nada localmente.

## Provisionamento

Você precisa nos mostrar uma infraestrutura provisionada usando Infra-as-code (terraform, pulumi, ansible, etc),
que deve conter:

- [OK - MVP_prov_cluster] Configure um cluster k8s em núvem (EKS, AKS ou GKE)
- [OK - MVP_prov_network] Configure a rede e suas subnets.
- [OK - MVP_prov_IAM] Configure a segurança usando o princípio de privilégio mínimo.
- Use uma IAM role para dar as permissões no cluster.
  Use sempre as melhores práticas para provisionar os recursos da núvem que escolher.

## CI/CD

Os requisitos são os seguintes:

- Escolha uma ferramenta de CI/CD apropriada.
- Configure um pipeline de build de contêiner docker da aplicação node.
- Configure um pipeline de deploy contínuo para o aplicação node em contêiner
  - Deve conter pelo menos uma fase de testes e uma fase de deploy.
  - A fase de deploy só deve ser executada se a fase de testes for bem-sucedida.
  - Ele deve seguir o fluxo do GitHub flow para o deploy.
  - O deploy deve ser feito no cluster k8s provisionado no Code Challenge.

## Aplicação

A aplicação node é super simples, apenas um express que expõe webserver HTTP na port 3000

Os endpoints são os seguintes:

- `/`
- `/health/check`

## Bonus

- Adicionar pipelines para teste lint, e outras coisas a mais na aplicação
- O deploy de kubernetes tiver interligado com ferramenta de infra as code

## Importante

Nós entendemos se você não tiver uma conta em uma dessas núvens, então faça o seu melhor com
código de provisionamento escolhido e disponibilize num repositório git, que nós testaremos.

# Instruções para uso do ambiente de desenvolvimento docker

Se não quiser instalar o client do gcp,azure,etc ou o node na sua máquina, basta executar o container da raiz:

```
docker volume create CONFIG_DATA
docker volume create KUBE_DATA
docker volume create PULUMI_DATA
docker compose up -d
docker exec -it kanastra-dev bash
```

Os volumes CONFIG_DATA, KUBE_DATA e PULUMI_DATA guardarão as credenciais para que não seja necessário realizar o login via CLI toda vez que o container for finalizado. Recomenda-se remover os volumes explicitamente ao final do uso.

## Login no GCP por dentro do container

Para este projeto, criei uma conta grátis no GCP e criei o projeto "kanastra-dev". Esses foraom os passos para autenticação dentro do container

```
gcloud auth application-default login --no-launch-browser
```

Copiar o link no browser para gerar um código e copiá-lo de volta no terminal do container. Depois configurar a quota e setar o projeto padrão

```
gcloud auth application-default set-quota-project kanastra-dev
gcloud config set project kanastra-dev
```

Todas as API's necessárias são habiliadas via código.

## Inicializações do Pulumi

Para não precisar criar conta na cloud do pulumi, optei por fazer o login local, e inicializar a stack de dev

```
pulumi login --local
pulumi stack init dev
```

# Executando e destruindo

```
npm run pulumi:dev-up
npm run pulumi:dev-destroy
```
