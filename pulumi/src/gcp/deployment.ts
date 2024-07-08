import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import * as gcp from '@pulumi/gcp';

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
                // resources: {
                //   requests: {
                //     cpu: '100m',
                //     memory: '128Mi',
                //   },
                //   limits: {
                //     cpu: '500m',
                //     memory: '256Mi',
                //   },
                // },
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
        ports: [{ port: 80, targetPort: 80 }],
        selector: appLabels,
      },
    },
    { provider: clusterProvider }
  );

  // // Create a Kubernetes Ingress
  // const ingress = new k8s.helm.v3.Chart(
  //   `${projectName}-ingress-nginx`,
  //   {
  //     chart: 'ingress-nginx',
  //     version: '4.0.6',
  //     fetchOpts: {
  //       repo: 'https://kubernetes.github.io/ingress-nginx',
  //     },
  //   },
  //   { provider: clusterProvider }
  // );
  // const ingressIp = ingress
  //   .getResourceProperty('v1/Service', 'nginx-ingress-controller', 'status')
  //   .apply((status) => status.loadBalancer.ingress[0].ip);
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

  // // Create a Horizontal Pod Autoscaler
  // const hpa = new k8s.autoscaling.v2beta2.HorizontalPodAutoscaler(
  //   `${projectName}-service-ingress`,
  //   {
  //     metadata: { namespace: namespace.metadata.name },
  //     spec: {
  //       scaleTargetRef: {
  //         apiVersion: 'apps/v1',
  //         kind: 'Deployment',
  //         name: deployment.metadata.name,
  //       },
  //       minReplicas: 1,
  //       maxReplicas: 10,
  //       metrics: [
  //         {
  //           type: 'Resource',
  //           resource: {
  //             name: 'cpu',
  //             target: {
  //               type: 'Utilization',
  //               averageUtilization: 80,
  //             },
  //           },
  //         },
  //         {
  //           type: 'Resource',
  //           resource: {
  //             name: 'memory',
  //             target: {
  //               type: 'Utilization',
  //               averageUtilization: 80,
  //             },
  //           },
  //         },
  //       ],
  //     },
  //   },
  //   { provider: clusterProvider }
  // );

  // // Create a firewall rule to allow HTTP and HTTPS traffic to the ingress IP
  // const firewallRule = new gcp.compute.Firewall('allow-ingress', {
  //   network: cluster.network.apply,
  //   allows: [
  //     {
  //       protocol: 'tcp',
  //       ports: ['80', '443'],
  //     },
  //   ],
  //   sourceRanges: ['0.0.0.0/0'],
  //   targetTags: ['ingress-nginx'],
  // });

  // // Add the target tag to the cluster nodes
  // const instanceGroupManager = pulumi
  //   .output(cluster.instanceGroupUrls)
  //   .apply((urls) => {
  //     return urls.map((url) =>
  //       gcp.compute.InstanceGroupManager.get({
  //         name: url.split('/').pop()!,
  //         zone: gcp.config.zone,
  //       })
  //     );
  //   });

  // instanceGroupManager.apply((managers) => {
  //   managers.forEach((manager) => {
  //     new gcp.compute.InstanceGroupManagerPatch(`add-tag-${manager.name}`, {
  //       instanceGroupManager: manager.name,
  //       zone: manager.zone,
  //       targetPools: manager.targetPools,
  //       versions: manager.versions,
  //       targetSize: manager.targetSize,
  //       baseInstanceName: manager.baseInstanceName,
  //       updatePolicy: manager.updatePolicy,
  //       namedPorts: manager.namedPorts,
  //       targetPools: manager.targetPools,
  //       autoHealingPolicies: manager.autoHealingPolicies,
  //       tags: {
  //         items: ['ingress-nginx'],
  //       },
  //     });
  //   });
  // });
  return {
    serviceName: service.metadata.name,
    deploymentName: deployment.metadata.name,
    serviceIP: service.status.loadBalancer.ingress[0].ip,
  };
}
