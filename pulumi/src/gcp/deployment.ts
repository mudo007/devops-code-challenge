import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';

const gcpConfig = new pulumi.Config('gcp');
const projectName = gcpConfig.require('project');

export function gcpCreateK8sServices(
  appName: string,
  clusterProvider: k8s.Provider
): {
  serviceName: pulumi.Output<string>;
  deploymentName: pulumi.Output<string>;
  serviceIP: pulumi.Output<string>;
} {
  // Create a Namespace
  const namespace = new k8s.core.v1.Namespace(
    `${projectName}-${appName}-namespace`,
    {},
    { provider: clusterProvider }
  );

  // Create a Kubernetes Deployment
  const appLabels = { app: appName };
  const deployment = new k8s.apps.v1.Deployment(
    `${appName}-deployment`,
    {
      metadata: {
        namespace: namespace.metadata.name,
        name: `${appName}-deployment`,
      },
      spec: {
        selector: { matchLabels: appLabels },
        replicas: 3,
        template: {
          metadata: { labels: appLabels },
          spec: {
            containers: [
              {
                name: `${appName}`,
                image:
                  'us-east1-docker.pkg.dev/kanastra-dev/kanastra-artifact-registry-docker-repo/hello-world:latest',
                ports: [{ containerPort: 3000 }],
                resources: {
                  requests: {
                    cpu: '100m',
                    memory: '128Mi',
                  },
                  limits: {
                    cpu: '500m',
                    memory: '256Mi',
                  },
                },
              },
            ],
          },
        },
      },
    },
    { provider: clusterProvider }
  );

  // Create a Kubernetes Service
  const service = new k8s.core.v1.Service(
    `${projectName}-service`,
    {
      metadata: {
        labels: appLabels,
        namespace: namespace.metadata.name,
        name: `${projectName}-service`,
      },
      spec: {
        type: 'LoadBalancer',
        ports: [{ port: 80, targetPort: 3000 }],
        selector: appLabels,
      },
    },
    { provider: clusterProvider }
  );

  const ingress = new k8s.networking.v1.Ingress(
    `${projectName}-service-ingress`,
    {
      metadata: {
        namespace: namespace.metadata.name,
        annotations: {
          'kubernetes.io/ingress.class': 'gce',
        },
      },
      spec: {
        rules: [
          {
            http: {
              paths: [
                {
                  path: '/*',
                  pathType: 'ImplementationSpecific',
                  backend: {
                    service: {
                      name: service.metadata.name,
                      port: {
                        number: 80,
                      },
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
    { provider: clusterProvider }
  );

  return {
    serviceName: service.metadata.name,
    deploymentName: deployment.metadata.name,
    serviceIP: service.status.loadBalancer.ingress[0].ip,
  };
}
