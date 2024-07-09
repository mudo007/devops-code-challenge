# TL; DR;

Deu certo, gostei bastente, consegui fazer tudo!

explicações em videos de 5 min cada:

- parte 1: https://www.loom.com/share/c27bd2026df34bacb4a7988a7c2f2538?sid=58a92cee-f7e0-4e62-bc17-b3c9c618e6e8
- parte 2: https://www.loom.com/share/0c8ef30230e44564a789d11a7d988109?sid=f9edad26-0f9a-4b28-a169-61a29f8d20aa
- parte 3: https://www.loom.com/share/1513cd676185435db4fe9d15ceadad93?sid=8c977c5e-2012-4b32-82b1-b3dcd3d95072
- parte 4: https://www.loom.com/share/1d333d2dccc24641b95ae4d7f453964c?sid=43ec8909-d046-494a-945c-3d39313b78b9
- parte 5: https://www.loom.com/share/14d6d3ff25ed486798b6ea55ff983020?sid=9f40d27a-8fbf-4a3c-bf98-4d28c2dce468

# Code Challenge DevOps Kanastra - Diogo Andrade

Este é um desafio para a vaga de DevopsLead. A minha estratégia de solução é:

- fiz um fork a partir do repo original
- Cloud escolhida: primeiramente Google Cloud, e AWS reutilizando o projeto ao máximo, se der tempo
- Ferramentas escolhidas: Pulumi + Typescript, Github Actions, Prettier + ESLint
- Metodologia de design: Todo código typescript será feito com TDD usando jest como framework de teste (fiz só para o provisionamento do cluster, mas abandonei)
- Controle de atividades: Atualização do README mesmo
- Organização: Cada aspecto da solução tem sua pasta separada, com separação de manifestos e configurações de ambientes de dev e prod quando pertinente. Não vou criar configurações extra para staging, pois este deve ser a simulação mais fiel do ambiente de produção, apenas com segredos, tokens, usuarios, etc diferentes
- Ambiente de desenvolvimento: o Dockerfile na raiz permite testar o projeto sem necessidade de instalar nada localmente.
- Estratégia de build e deploy: Como o projeto é solitário, todo o push para o github vai disparar um teste e build. A criação de tags vai disparar não só o test e build, mas também a criação de um container e push para o Artifact Registry, e deploy no cluster

# Conclusão

Todas as etapas foram concluídas com sucesso, incluindo os bonus sugeridos.

## Coisas que eu gostaria de ter feito com mais tempo:

- Refatorar o código: Comecei com uma estrutura modular que pudesse ser "cloud-agnóstica" e consegui modularizar a maior parte dos serviços, cada um no seu arquivo-fonte. Mas o construtor da classe "Cluster" acabou ficando uma tripa
- Adicionar features na aplicação, pois tenho muita experiência como DEV, e daria para fazer algo no contexto do negocio da empresa. Por exemplo, quanddo vou fazer aporte mensal nos meus fundos imobiliários na XP, perco um tempão "passando roupa" em planilha para calcular quanto aporto em cada um para manter a proporção da minha estratégia. Pensei em fazer um app simples com dados mock mesmo que calcula isso automaticamente
- Conseguir usar TDD: Comecei empolgado, e consegui escrever um teste de criação do cluster, mas assim que fui adicionar a parte de networking nos testes, o chatGPT começou a testar se o mock foi criado, aí abandonei. Se for possível usar os testes no dia-a-dia do uso do pulumi, pode acelerar bastante o desenvolvimento, pois o ciclo de dar o "up", e ver se funcionou, é muito lento
- Gostaria de adicionar mais coisas que sempre convém ter em projetos profissionais, como prometheus para métricas e health checks, dashboard de grafana com alertas e notificações para incidentes, certificado para https com bot de letsencrypt, etc.

## Considerações finais

Gostei bastante de ter participado do teste, foi uma oportunidade de aprender algo que eu estava querendo a muito tempo, mas não conseguia me organizar. Como minha experiência com terraform, helm, kubernetes foi muito breve e há um ano e meio atrás, foi muito bom re-aprender infra-as-code praticamente do 0. O uso do Pulumi foi sugestão do Jesse, que me indicou para a vaga. Como eu já tinha uma certa experiência com typescript, de fazer alguns bootcamps e praticar diariamente no primeiro trimestre do ano, achei bem gratificante poder usar na prática.

Abaixo fica o roteiro original com as tags de cada etapa concluída, e em seguida, as instruções para rodar o projeto "from scratch"

# Roteiro original do projeto com as etapas concluídas

Cada tag na lista, exemplo: "MVP_prov_cluster", é mapeada para a tag correspondente no repositório

## Provisionamento

Você precisa nos mostrar uma infraestrutura provisionada usando Infra-as-code (terraform, pulumi, ansible, etc),
que deve conter:

- [OK - MVP_prov_cluster] Configure um cluster k8s em núvem (EKS, AKS ou GKE)
- [OK - MVP_prov_network] Configure a rede e suas subnets.
- [OK - MVP_prov_IAM] Configure a segurança usando o princípio de privilégio mínimo.
- [OK - MVP_prov_deploy_sa] Use uma IAM role para dar as permissões no cluster.
  Use sempre as melhores práticas para provisionar os recursos da núvem que escolher.

## CI/CD

Os requisitos são os seguintes:

- [OK - MVP_cicd_ci] Escolha uma ferramenta de CI/CD apropriada.
- [OK - MVP_cicd_ci] Configure um pipeline de build de contêiner docker da aplicação node.
- [OK - MVP_cicd_cd] Configure um pipeline de deploy contínuo para o aplicação node em contêiner
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

- [OK - BONUS_ts_app] Conversão da aplicação para typescript
- [OK - MVP_cicd_cd] Adicionar pipelines para teste lint, e outras coisas a mais na aplicação
- [OK - MVP_cicd_cd] O deploy de kubernetes tiver interligado com ferramenta de infra as code

## Importante

Nós entendemos se você não tiver uma conta em uma dessas núvens, então faça o seu melhor com
código de provisionamento escolhido e disponibilize num repositório git, que nós testaremos.

# Passo-a-passo para executar o projeto do 0

## [opcional] Instruções para uso do ambiente de desenvolvimento docker

Se não quiser instalar o client do gcp,azure,etc ou o node na sua máquina, basta executar o container de desivolvimento a partir da raiz do projeto:

```
docker volume create CONFIG_DATA
docker volume create KUBE_DATA
docker volume create PULUMI_DATA
docker compose up -d
docker exec -it kanastra-dev bash
```

Os volumes CONFIG_DATA, KUBE_DATA e PULUMI_DATA guardarão as credenciais para que não seja necessário realizar o login via CLI toda vez que o container for finalizado. Recomenda-se remover os volumes explicitamente ao final do uso.

## Login no GCP por dentro do container

Para este projeto, criei uma conta grátis no GCP e criei o projeto "kanastra-dev". Esses foram os passos para autenticação dentro do container

```
gcloud auth login
gcloud auth application-default login
```

Em cada um dos comandos, você deve copiar o link no browser para gerar um código e copiá-lo de volta no terminal do container. Depois configurar a quota e setar o projeto padrão.

```
gcloud auth application-default set-quota-project kanastra-dev
gcloud config set project kanastra-dev
```

Todas as API's necessárias são habilitadas via código.

## Inicializações do Pulumi

- Todos os comandos daqui pra frente devem ser realizados a partir da pasta ./pulumi

```
cd pulumi
```

- Crie sua conta em https://app.pulumi.com, se não o tiver feito ainda`

```
npm install
pulumi login
```

- Crie uma organização, no para este projeto, eu criei a organização "kanastra-challenge-da", mas você pode usar uma existente, se preferir
- Configure a organização como padrão para o projeto

```
pulumi org set-default kanastra-challenge-da
```

- Gere um access token (https://app.pulumi.com/seu_uername/settings/tokens)e cole no terminal, caso esteja executando dentro do container, ou aperte enter para continuar pelo browser
- Inicialize o prokjeto com o comando

```
pulumi stack init dev

```

## Provisionando toda a infra:

Rode o comando

```
npm run pulumi:dev-up

```

Pode ser que o deployment fique "preso" na etapa

```
kubernetes:apps/v1:Deployment            hello-world-deployment
```

Porque ainda não há container de aplicação disponível, você pode dar um CTRL+C sem problemas.

## Adicionando chaves json secretas ao github actions

As chaves são necessárias para que as automações do github actions funcionem.

Você pode abrir o painel do gcp, navegar pelo secrets manager, copiar o json do "cluster-deploy-secret-id" e o "cluster-create-secret-id" e colar em um novo "repository Secrets" do github (Github.com -> repositorio -> settings do repo -> Secrets and Variables -> Repository secrets -> New repository secret -> GAR_JSON_KEY / GOOGLE_CREDENTIALS)

Entretanto, para que, em momento algum os secrets sejam expostos, seja no terminal, ou no bash history, ou no file system que seja, recomenda-se redirecionar a saída do comando que lê o secret para a entrada do comando que grava no github actions. Ajuste o parâmetro "--repo mudo007/devops-code-challenge" para o seu, caso faça um fork a partir deste. Deve-se autenticar primeiramente na cli do github com "gh auth login", e seguir o rocesso de autenticação desejado.
Depois deve-se gerear um access token [(beta) ](https://github.com/settings/tokens?type=beta) com Repository permissions de apenas "read/write" para Secrets, e "read" em Metadata. O comando é:

```

gcloud secrets versions access latest --secret=cluster-deploy-secret-id | gh secret set GAR_JSON_KEY --repo mudo007/devops-code-challenge
gcloud secrets versions access latest --secret=cluster-create-secret-id | gh secret set GOOGLE_CREDENTIALS --repo mudo007/devops-code-challenge

```

Para o token de acesso do Pulumi, não identifiquei um método para ler o valor do token a partir de uma cli, então, ele deve ser colado no terminal mesmo, ou via painel do github

```
echo "seu_personal_access_token_pulumi" | gh secret set PULUMI_ACCESS_TOKEN --repo mudo007/devops-code-challenge
```

## Configurando a piepline para seu projeto

Infelizmente, não cosnegui utilizar o nome da organização no nome da stack do github actions, então você deverá alterar a linha 107 do arquivo .github/build-hello-world.yml e mudar "kanastra-challenge-da" para o nomed a sua organização

## Gerando tags para dar trigger no deploy automático

Se você criar uma nova tag, e dar push, a nova imagem será "deployada" no cluster. Pode-se verificar o sucesso da operação Acessando o "Revision History" e verificando que uma nova versão foi criada

## Verificando que tudo funcionu:

Apenas Cole no browser o endereço de ip "ServiceIP" gerado na lista de Outputs da pipeline do github actions, e você deverá ver um "hello world"

# Destruindo tudo:

Após terminados os testes com o projeto, você pode limpar tudo com o comando:

```
npm run pulumi:dev-destroy

```
