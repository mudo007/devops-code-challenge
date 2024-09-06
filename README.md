# Code Challenge DevOps Kanastra - Diogo Andrade

This is a challenge for the DevOps Lead position. My solution strategy is:

- I forked from the original repo
- Chosen Cloud: primarily Google Cloud, and AWS reusing the project as much as possible if time allows
- Chosen tools: Pulumi + TypeScript, GitHub Actions, Prettier + ESLint
- Design methodology: All TypeScript code will be developed using TDD with Jest as the testing framework (I only did this for cluster provisioning but then abandoned it)
- Activity tracking: Updated README only
- Organization: Each aspect of the solution has its own separate folder, with separation of manifests and configurations for dev and prod environments when relevant. I will not create extra configurations for staging, as this should be the most faithful simulation of the production environment, just with different secrets, tokens, users, etc.
- Development environment: The Dockerfile at the root allows testing the project without needing to install anything locally.
- Build and deploy strategy: Since the project is standalone, every push to GitHub will trigger a test and build. Tag creation will trigger not only test and build but also container creation, push to Artifact Registry, and deployment to the cluster.

# Conclusion

All stages were successfully completed, including the suggested bonuses.

## Things I would have liked to do with more time:

- Refactor the code: I started with a modular structure that could be "cloud-agnostic" and managed to modularize most of the services, each in its source file. However, the constructor of the "Cluster" class ended up being quite lengthy.
- Add features to the application, as I have a lot of experience as a DEV, and I could create something in the company's business context. For example, when I make my monthly contributions to my real estate funds at XP, I waste a lot of time "ironing out" spreadsheets to calculate how much to contribute to each one to maintain the proportion of my strategy. I thought of making a simple app with mock data that calculates this automatically.
- Successfully use TDD: I started enthusiastically and managed to write a cluster creation test, but as soon as I added the networking part to the tests, ChatGPT started testing if the mock was created, so I abandoned it. If it's possible to use tests daily with Pulumi, it can speed up development a lot because the cycle of running `up` and seeing if it worked is very slow.
- I would like to add more things that are always convenient in professional projects, such as Prometheus for metrics and health checks, a Grafana dashboard with alerts and notifications for incidents, an HTTPS certificate with Let's Encrypt bot, etc.

## Final Considerations

I really enjoyed participating in the test; it was an opportunity to learn something I had been wanting to do for a long time but couldn't organize myself to do. Since my experience with Terraform, Helm, and Kubernetes was very brief and a year and a half ago, it was great to relearn infra-as-code almost from scratch. Using Pulumi was Jesse's suggestion, who referred me to the position. As I already had some experience with TypeScript, from doing some boot camps and practicing daily in the first quarter of the year, it was gratifying to use it in practice.

Below is the original script with the tags of each completed step, followed by instructions to run the project "from scratch."

# Original Project Script with Completed Steps

Each tag in the list, e.g., "MVP_prov_cluster," maps to the corresponding tag in the repository.

## Provisioning

You need to show us an infrastructure provisioned using Infrastructure-as-Code (Terraform, Pulumi, Ansible, etc.), which should contain:

- [OK - MVP_prov_cluster] Set up a Kubernetes cluster in the cloud (EKS, AKS, or GKE)
- [OK - MVP_prov_network] Set up the network and its subnets.
- [OK - MVP_prov_IAM] Set up security using the principle of least privilege.
- [OK - MVP_prov_deploy_sa] Use an IAM role to grant permissions in the cluster.
  Always use best practices for provisioning resources in the chosen cloud.

## CI/CD

The requirements are as follows:

- [OK - MVP_cicd_ci] Choose an appropriate CI/CD tool.
- [OK - MVP_cicd_ci] Set up a pipeline for building the application's Docker container.
- [OK - MVP_cicd_cd] Set up a continuous deployment pipeline for the Node application in the container.
  - It should have at least a test phase and a deploy phase.
  - The deploy phase should only be executed if the test phase is successful.
  - It should follow the GitHub flow for deployment.
  - The deployment should be done in the Kubernetes cluster provisioned in the Code Challenge.

## Application

The Node application is super simple, just an Express server exposing an HTTP web server on port 3000.

The endpoints are:

- `/`
- `/health/check`

## Bonus

- [OK - BONUS_ts_app] Conversion of the application to TypeScript
- [OK - MVP_cicd_cd] Add pipelines for lint testing and other things to the application
- [OK - MVP_cicd_cd] Integrate the Kubernetes deployment with the infra-as-code tool

## Important

We understand if you don't have an account in one of these clouds, so do your best with the chosen provisioning code and make it available in a git repository, which we will test.

# Step-by-Step Guide to Running the Project from Scratch

## [Optional] Instructions for Using the Docker Development Environment

If you don't want to install the GCP, Azure, etc., client or Node on your machine, simply run the development container from the project's root:

```
docker volume create CONFIG_DATA
docker volume create KUBE_DATA
docker volume create PULUMI_DATA
docker compose up -d
docker exec -it kanastra-dev bash
```

The volumes CONFIG_DATA, KUBE_DATA, and PULUMI_DATA will store credentials so you don't need to log in via CLI every time the container is stopped. It is recommended to remove the volumes explicitly after use.

## Login to GCP Inside the Container

For this project, I created a free account on GCP and created the "kanastra-dev" project. These were the steps to authenticate inside the container:

```
gcloud auth login
gcloud auth application-default login
```

In each command, you must copy the link in the browser to generate a code and paste it back into the container terminal. Then configure the quota and set the default project.

```
gcloud auth application-default set-quota-project kanastra-dev
gcloud config set project kanastra-dev
```

All necessary APIs are enabled via code.

## Pulumi Initialization

- All commands from now on should be run from the `./pulumi` folder.

```
cd pulumi
```

- Create your account at https://app.pulumi.com if you haven't done so already.

```
npm install
pulumi login
```

- Create an organization; for this project, I created the "kanastra-challenge-da" organization, but you can use an existing one if you prefer.
- Set the organization as the default for the project.

```
pulumi org set-default kanastra-challenge-da
```

- Generate an access token (https://app.pulumi.com/your_username/settings/tokens) and paste it into the terminal if running inside the container, or press enter to continue via browser.
- Initialize the project with the command:

```
pulumi stack init dev
```

## Provisioning the Entire Infrastructure:

Run the command:

```
npm run pulumi:dev-up
```

The deployment might get "stuck" at the step:

```
kubernetes:apps/v1:Deployment            hello-world-deployment
```

Because there is no application container available yet, you can safely press CTRL+C.

## Adding JSON Secret Keys to GitHub Actions

The keys are necessary for GitHub Actions automation to work.

You can open the GCP panel, navigate to the Secrets Manager, copy the JSON from "cluster-deploy-secret-id" and "cluster-create-secret-id," and paste it into a new "Repository Secret" in GitHub (Github.com -> repository -> repo settings -> Secrets and Variables -> Repository secrets -> New repository secret -> GAR_JSON_KEY / GOOGLE_CREDENTIALS).

However, to avoid exposing the secrets at any point (terminal, bash history, filesystem, etc.), it is recommended to redirect the output of the command that reads the secret to the command that saves it in GitHub Actions. Adjust the parameter `--repo mudo007/devops-code-challenge` to yours if you fork from this one. First, authenticate in GitHub CLI with `gh auth login`, and follow the desired authentication process. Then generate an access token [(beta)](https://github.com/settings/tokens?type=beta) with Repository permissions of only "read/write" for Secrets and "read" in Metadata. The command is:

```
gcloud secrets versions access latest --secret=cluster-deploy-secret-id | gh secret set GAR_JSON_KEY --repo mudo007/devops-code-challenge
gcloud secrets versions access latest --secret=cluster-create-secret-id | gh secret set GOOGLE_CREDENTIALS --repo mudo007/devops-code-challenge
```

For the Pulumi access token, I couldn't identify a method to read the token value from a CLI, so it must be pasted into the terminal or via GitHub panel.

```
echo "your_personal_access_token_pulumi" | gh secret set PULUMI_ACCESS_TOKEN --repo mudo007/devops-code-challenge
```

## Configuring the Pipeline for Your Project

Unfortunately, I was unable to use the organization name in the stack name of GitHub Actions, so you need to change line 107 of the `.github/build-hello-world.yml` file and change "kanastra-challenge-da" to the name of your organization.

## Generating Tags to Trigger Automatic Deployment

If you create a new tag and push it, the new image will be deployed to the cluster. You can verify the success of the operation by accessing the "Revision History" and checking that a new version has been created.

## Verifying Everything Worked:

Just paste the IP address "ServiceIP" generated in the GitHub Actions pipeline outputs into the browser, and you should see a "hello world."

# Destroying Everything:

After completing the tests with the project, you can clean everything up with the command:

```
npm run pulumi:dev-destroy
```
