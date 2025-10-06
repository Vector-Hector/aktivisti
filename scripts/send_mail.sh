#!/bin/sh
set -e
set -o xtrace

# Some distros deploy SNAIL as mailx.
SNAIL="s-nail"

$SNAIL -t <<EOF
To: aktivisti@control.alt.coop
Subject: [$CI_PROJECT_NAME] NPM outdated dependencies

Hello,

The "$CI_PROJECT_NAME" has outdated dependencies.
Project URL: $CI_PROJECT_URL

NPM audit returned the following:
$(npm audit)

Best regards,
control.alt.coop npm audit bot
EOF
