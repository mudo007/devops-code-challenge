import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';

const gcpConfig = new pulumi.Config('gcp');
const projectName = gcpConfig.require('project');

export function gcpCreateK8sServices(
  appName: string,
  clusterProvider: k8s.Provider
) {
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
      metadata: { namespace: namespace.metadata.name },
      spec: {
        selector: { matchLabels: appLabels },
        replicas: 1,
        template: {
          metadata: { labels: appLabels },
          spec: {
            containers: [
              {
                name: `${appName}-app`,
                image:
                  'us-east1-docker.pkg.dev/kanastra-dev/kanastra-artifact-registry-docker-repo/hello_world:latest',
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
      metadata: { labels: appLabels, namespace: namespace.metadata.name },
      spec: {
        type: 'LoadBalancer',
        ports: [{ port: 80, targetPort: 80 }],
        selector: appLabels,
      },
    },
    { provider: clusterProvider }
  );

  // Create a Kubernetes Ingress
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

  // Create a Horizontal Pod Autoscaler
  const hpa = new k8s.autoscaling.v2beta2.HorizontalPodAutoscaler(
    `${projectName}-service-ingress`,
    {
      metadata: { namespace: namespace.metadata.name },
      spec: {
        scaleTargetRef: {
          apiVersion: 'apps/v1',
          kind: 'Deployment',
          name: deployment.metadata.name,
        },
        minReplicas: 1,
        maxReplicas: 10,
        metrics: [
          {
            type: 'Resource',
            resource: {
              name: 'cpu',
              target: {
                type: 'Utilization',
                averageUtilization: 80,
              },
            },
          },
          {
            type: 'Resource',
            resource: {
              name: 'memory',
              target: {
                type: 'Utilization',
                averageUtilization: 80,
              },
            },
          },
        ],
      },
    },
    { provider: clusterProvider }
  );
}
