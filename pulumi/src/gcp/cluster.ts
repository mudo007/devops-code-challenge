import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';

// Global setups for google cloud
const gcpConfig = new pulumi.Config('gcp');
const gcpClusterConfig = new pulumi.Config('gcp-cluster');
pulumi.runtime.setConfig('gcp:project', gcpConfig.require('project'));
pulumi.runtime.setConfig('gcp:region', gcpConfig.require('region'));

// Cluster specific configurations
const location = gcpConfig.require('region');
const initialNodeCount = Number(gcpClusterConfig.require('initialNodeCount'));
const deletionProtection =
  gcpClusterConfig.require('deletionProtection') === 'true';
const machineType = gcpClusterConfig.require('machineType');

// API dependency
const containerApi = new gcp.projects.Service('containerApi', {
  service: 'container.googleapis.com',
});

// Creates the Cluster with a namespace
export function gcpCreateCluster(
  name: string,
  vpc: gcp.compute.Network,
  vpcSubnet: gcp.compute.Subnetwork,
  sa: gcp.serviceaccount.Account
): {
  clusterOutput: pulumi.Output<gcp.container.Cluster>;
  clusterProvider: k8s.Provider;
  clusterKubeConfig: pulumi.Output<string>;
} {
  const gcpCluster = new gcp.container.Cluster(
    name,
    {
      initialNodeCount: initialNodeCount,
      location: location,
      nodeConfig: {
        machineType: machineType,
        serviceAccount: sa.email,
      },
      deletionProtection: deletionProtection,
      network: vpc.id,
      subnetwork: vpcSubnet.id,
      ipAllocationPolicy: {
        clusterSecondaryRangeName: 'pods',
        servicesSecondaryRangeName: 'services',
      },
    },
    { dependsOn: containerApi }
  );

  //retrieve the kubeconfig
  const kubeconfig = pulumi
    .all([gcpCluster.name, gcpCluster.endpoint, gcpCluster.masterAuth])
    .apply(([name, endpoint, masterAuth]) => {
      const context = `${gcp.config.project}_${gcp.config.region}_${name}`;
      return `apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ${masterAuth.clusterCaCertificate}
    server: https://${endpoint}
  name: ${context}
contexts:
- context:
    cluster: ${context}
    user: ${context}
  name: ${context}
current-context: ${context}
kind: Config
preferences: {}
users:
- name: ${context}
  user:
    exec:
      apiVersion: client.authentication.k8s.io/v1beta1
      command: gke-gcloud-auth-plugin
      installHint: Install gke-gcloud-auth-plugin for use with kubectl by following
        https://cloud.google.com/blog/products/containers-kubernetes/kubectl-auth-changes-in-gke
      provideClusterInfo: true
`;
    });

  // Create a Kubernetes provider instance using the exported kubeconfig
  const k8sProvider = new k8s.Provider('k8sProvider', {
    kubeconfig,
  });

  return {
    clusterOutput: pulumi.output(gcpCluster),
    clusterProvider: k8sProvider,
    clusterKubeConfig: kubeconfig,
  };
}
