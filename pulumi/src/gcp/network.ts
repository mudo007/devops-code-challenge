import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';

// Creates the VPC awith secondary ranges for pod and services subnets
export function gcpCreateNetwork(name: string): {
  vpc: gcp.compute.Network;
  vpcSubnet: gcp.compute.Subnetwork;
} {
  const gcpConfig = new pulumi.Config('gcp');
  const location = gcpConfig.require('region');
  pulumi.runtime.setConfig('gcp:region', gcpConfig.require('region'));
  pulumi.runtime.setConfig('gcp:project', gcpConfig.require('project'));

  const networkConfig = new pulumi.Config('gcp-network');
  const vpcSubnetCidr = networkConfig.require('vpcSubnetCidr');
  const podSubnetCidr = networkConfig.require('podSubnetCidr');
  const serviceSubnetCidr = networkConfig.require('serviceSubnetCidr');

  const vpc = new gcp.compute.Network(name, {
    autoCreateSubnetworks: false,
  });

  const vpcSubnet = new gcp.compute.Subnetwork(`${name}-subnet`, {
    ipCidrRange: vpcSubnetCidr,
    region: location,
    network: vpc.name,
    secondaryIpRanges: [
      { rangeName: 'pods', ipCidrRange: podSubnetCidr },
      { rangeName: 'services', ipCidrRange: serviceSubnetCidr },
    ],
  });

  return {
    vpc,
    vpcSubnet,
  };
}
