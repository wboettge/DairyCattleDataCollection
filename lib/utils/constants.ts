// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const CONFIG = {
    // e.g. ssh-rsa AAAA.......BBBB username@example.com
    'sshPublicKey': 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDuxYKm48XjdYqoSRAFNRe7HUhsWSOIaoaEROJzOoTCIi6vUEDq/KGxSjwsqpHZ0SQ0YY+nG4asTFLteEiuq+C60ib0+gSlVMZ3wQvHFLL93uY/RqagGJ5J2YE7t/hgievPrh4xaeYmWKYQJRYKjqJNNtAbSZyEujv8GsZmgPjByQyi5qzz5Oj5xsU8opcazXLp4USenAX15QiyU3xEi4EOT+JUcfbN3f+8/ZURBM1hmdvdZMVsy2GB6rOhSZsios2Tb58R1HuvEe19zqJTIlNeXtblG80bHBF36R9r36NGz1Ec9pLxHw0UGfGoDsAMbRt5j9Dk3rVWHNlW7WAawkj9 waltboettge@MacBook-Air.attlocal.net',
    // Name of the secret where the Wifi password is stored
    // Removed since UWNet is unsecured
    // 'wifiPasswordSecretName': 'RPI_WIFI_PASSWORD',
    // For more information on how to configure Wifi SSID and Country
    // see https://www.raspberrypi.org/documentation/configuration/wireless/wireless-cli.md
    'wifiCountry': 'us',
    'wifiSsid': 'UWNet',
};