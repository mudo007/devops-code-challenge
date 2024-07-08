import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';

const computeApi = new gcp.projects.Service('computeApi', {
  service: 'compute.googleapis.com',
});

// Creates the VPC awith secondary ranges for pod and services subnets
export function gcpCreateNetwork(name: string): {
  vpc: gcp.compute.Network;
  vpcSubnet: gcp.compute.Subnetwork;
} {
  const gcpConfig = new pulumi.Config('gcp');
  const location = gcpConfig.require('region');
  const projectName = gcpConfig.require('project');
  pulumi.runtime.setConfig('gcp:region', gcpConfig.require('region'));
  pulumi.runtime.setConfig('gcp:project', gcpConfig.require('project'));

  const networkConfig = new pulumi.Config('gcp-network');
  const vpcSubnetCidr = networkConfig.require('vpcSubnetCidr');
  const podSubnetCidr = networkConfig.require('podSubnetCidr');
  const serviceSubnetCidr = networkConfig.require('serviceSubnetCidr');

  const vpc = new gcp.compute.Network(
    name,
    {
      autoCreateSubnetworks: false,
    },
    { dependsOn: computeApi }
  );

  const vpcSubnet = new gcp.compute.Subnetwork(`${name}-subnet`, {
    ipCidrRange: vpcSubnetCidr,
    region: location,
    network: vpc.name,
    secondaryIpRanges: [
      { rangeName: 'pods', ipCidrRange: podSubnetCidr },
      { rangeName: 'services', ipCidrRange: serviceSubnetCidr },
    ],
  });

  // Create a Firewall Rule to allow traffic on port 80 of the cluster ingress
  const firewallRule = new gcp.compute.Firewall(
    `${projectName}-${name}-allow-http`,
    {
      network: vpc.name,
      allows: [
        {
          protocol: 'tcp',
          ports: ['80'],
        },
      ],
      direction: 'INGRESS',
      sourceRanges: ['0.0.0.0/0'], // Allow traffic from any IP
      targetTags: ['http-server'], //same tag on the cluster
    }
  );

  return {
    vpc,
    vpcSubnet,
  };
}
