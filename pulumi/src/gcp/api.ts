import * as gcp from '@pulumi/gcp';

export function enableGcpApis() {
  const services = [
    'compute.googleapis.com',
    'container.googleapis.com',
    'secretmanager.googleapis.com',
  ];

  services.forEach((service) => {
    new gcp.projects.Service(`enable-${service}`, {
      service,
    });
  });
}
