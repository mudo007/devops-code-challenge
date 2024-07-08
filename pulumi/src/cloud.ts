/* eslint-disable no-case-declarations */
import * as pulumi from '@pulumi/pulumi';
import * as gcp from '@pulumi/gcp';
import { gcpCreateCluster } from './gcp/cluster';
import { gcpCreateNetwork } from './gcp/network';
import { enableGcpApis } from './gcp/api';
import { createServiceAccountKeyAndStoreSecret } from './gcp/serviceAccount';
import { createArtifactRepository } from './gcp/gar';
import { gcpCreateK8sServices } from './gcp/deployment';

// Abstracts away the creation of a cluster on different cloud providers
export class Cluster {
  k8sCluster: pulumi.Output<gcp.container.Cluster>;
  k8sKubeConfig: pulumi.Output<string>;
  k8sServiceName: pulumi.Output<string>;
  k8sServiceIP: pulumi.Output<string>;
  k8sDeploymentName: pulumi.Output<string>;

  constructor(name: string, cloudProvider: string) {
    // This switch-case is a placeholder for multi-cloud deployments
    switch (cloudProvider) {
      case 'gcp':
        //Early enabling of all necessary GCP API's
        enableGcpApis();

        //Create the necessary Service accounts, with their granular permitions
        //cluster creation
        const { serviceAccount: clusterCreateSa } =
          createServiceAccountKeyAndStoreSecret('cluster-create', [
            'roles/container.admin',
            'roles/compute.networkAdmin',
            'roles/artifactregistry.reader',
          ]);
        // container push and deployment from github actions
        const { serviceAccount: deploySa, accountKey: deployKey } =
          createServiceAccountKeyAndStoreSecret('cluster-deploy', [
            'roles/container.developer',
            'roles/artifactregistry.writer',
          ]);
        // Create the Artifact Registry
        createArtifactRepository();
        // Create the networking configuration
        const { vpc, vpcSubnet } = gcpCreateNetwork(name);

        // Create the cluster
        const { clusterOutput, clusterProvider, clusterKubeConfig } =
          gcpCreateCluster(name, vpc, vpcSubnet, clusterCreateSa);

        // Create deployment
        //const { serviceName, deploymentName, serviceIP } = gcpCreateK8sServices(
        const { deploymentName, serviceName, serviceIP } = gcpCreateK8sServices(
          'hello-world',
          clusterProvider
        );

        // Pulumi exports
        this.k8sCluster = pulumi.output(clusterOutput);
        this.k8sKubeConfig = clusterKubeConfig;
        this.k8sServiceName = serviceName;
        this.k8sServiceIP = serviceIP;
        this.k8sDeploymentName = deploymentName;
        break;

      // case 'aws':
      //   ...
      //   break;
      default:
        throw new Error(`Unknown cloud provider: ${cloudProvider}`);
    }
  }
}
