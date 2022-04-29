#!/bin/bash
# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

RASPBIAN_DOWNLOAD_FILENAME="raspbian_image.zip"
RASPBIAN_SOURCE_URL="https://downloads.raspberrypi.org/raspios_armhf_latest"
RASPBIAN_URL_BASE="https://downloads.raspberrypi.org/raspios_armhf/images/"
SDCARD_MOUNT="/mnt/sdcard"

# Download raspbian, unzip it and SHA verify the download
wget $RASPBIAN_SOURCE_URL -O $RASPBIAN_DOWNLOAD_FILENAME
VERSION="$( wget -q $RASPBIAN_URL_BASE -O - | xmllint --html --xmlout --xpath 'string(/html/body/table/tr[last()-1]/td/a/@href)' - )"
RASPBIAN_SOURCE_SHA256_FILE=$( wget -q $RASPBIAN_URL_BASE/$VERSION -O - | xmllint --html --xmlout --xpath 'string(/html/body/table/tr/td/a[contains(@href, "256")])' - )
RASPBIAN_SOURCE_SHA256=$( wget -q "$RASPBIAN_URL_BASE/$VERSION/$RASPBIAN_SOURCE_SHA256_FILE" -O - | awk '{print $1}' )
RASPBIAN_DOWNLOAD_SHA256=$( sha256sum $RASPBIAN_DOWNLOAD_FILENAME |awk '{printf $1}' )
if [ ! -z $RASPBIAN_SOURCE_SHA256 ] && [ "$RASPBIAN_DOWNLOAD_SHA256" != "$RASPBIAN_SOURCE_SHA256" ]; then echo "Build aborted.  SHA256 does not match"; exit 2; fi
7z x -y $RASPBIAN_DOWNLOAD_FILENAME

# Find the image name within the zip & set to variable'
EXTRACTED_IMAGE=$( 7z l $RASPBIAN_DOWNLOAD_FILENAME | awk '/-raspios-/ {print $NF}' )

echo EXTRACTED_IMAGE: $EXTRACTED_IMAGE

# Create device mapper entries for boot disk and root disk
KPARTX_OUTPUT=$( kpartx -v -a "$EXTRACTED_IMAGE" )
BOOT_DISK=$( echo $KPARTX_OUTPUT | grep -o 'loop.p1' )
ROOT_DISK=$( echo $KPARTX_OUTPUT | grep -o 'loop.p2' )

echo mount boot disk

# Mount boot disk
mkdir -p $SDCARD_MOUNT
mount /dev/mapper/${BOOT_DISK} $SDCARD_MOUNT

# Configure Wifi
# See https://raspberrypi.stackexchange.com/questions/15393/connect-to-unsecured-wireless-network
echo "
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=$WIFI_COUNTRY

network={
    ssid=\"$WIFI_SSID\"
    key_mgmt=NONE
}" > "$SDCARD_MOUNT/wpa_supplicant.conf"

# Enable ssh
echo enable ssh
touch "$SDCARD_MOUNT/ssh"

# Copy firstboot script that runs the fleet provisioning client on first boot
cp -v firstboot.bash "$SDCARD_MOUNT/firstboot.bash"
umount "$SDCARD_MOUNT"

# Mount root disk
mount /dev/mapper/${ROOT_DISK} $SDCARD_MOUNT

# Change the sshd_config file to disable password authentication
sed -e 's;^#PasswordAuthentication.*$;PasswordAuthentication no;g' -e 's;^PermitRootLogin .*$;PermitRootLogin no;g' -i "$SDCARD_MOUNT/etc/ssh/sshd_config"

# Add the ssh public key to the list of authorized keys
mkdir "$SDCARD_MOUNT/home/pi/.ssh"
chmod 0700 "$SDCARD_MOUNT/home/pi/.ssh"
chown 1000:1000 "$SDCARD_MOUNT/home/pi/.ssh"
echo $SSH_PUBLIC_KEY >> "$SDCARD_MOUNT/home/pi/.ssh/authorized_keys"
chown 1000:1000 "$SDCARD_MOUNT/home/pi/.ssh/authorized_keys"
chmod 0600 "$SDCARD_MOUNT/home/pi/.ssh/authorized_keys"

# Copy the fleet provisioning client
cp -rv "aws-iot-fleet-provisioning" "$SDCARD_MOUNT/etc/"

# Copy and enable the first boot service that triggers the firstboot script on startup
cp -v firstboot.service "$SDCARD_MOUNT/lib/systemd/system/firstboot.service"
cd "$SDCARD_MOUNT/etc/systemd/system/multi-user.target.wants" && ln -s "/lib/systemd/system/firstboot.service" "./firstboot.service"
cd -

# Unmount disk and create the artifact
umount "$SDCARD_MOUNT"
cp -v $EXTRACTED_IMAGE $ARTIFACT_IMAGE_NAME
