#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
base='https://www.omg.org/spec/BPMN/20100501'
files=(BPMN20.cmof BPMNDI.cmof DC.cmof DI.cmof BPMN20.xsd BPMNDI.xsd DC.xsd DI.xsd Semantic.xsd BPMN20-FromXMI.xslt)
for f in "${files[@]}"; do
  echo "FETCH $f"
  curl --fail --location --silent --show-error "$base/$f" --output "$f"
done
echo 'FETCH Infrastructure.cmof'
curl --fail --location --silent --show-error 'https://www.omg.org/spec/BPMN/20100502/Infrastructure.cmof' --output Infrastructure.cmof
shasum -a 256 "${files[@]}" Infrastructure.cmof | sort > SHA256SUMS.txt
cat SHA256SUMS.txt
