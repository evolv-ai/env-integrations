# CPC Upgrade Eligibility Banner Audience

Created for experiment [CPC Upgrade Eligibility Banner](https://evolv-ai.atlassian.net/browse/VCG2-867)

Sets `localStorage` item on `https://www.verizon.com/digital/nsa/secure/ui/udb/#/` of `evolv:upgrade-eligibility` containing a JSON object indexed by phone number and eligibility status.

Reads `evolv:upgrade-eligibility` on `https://www.verizon.com/digital/nsa/secure/ui/cpc/#/dataselectorperks` or `https://www.verizon.com/digital/nsa/secure/ui/cpc/#/dataselectorperks`, setting boolean localStorage entries for `evolv:cpc-iphone` and `evolv:cpc-upgrade-eligible` and sets remoteContext entries for `vz.CPCIPhone` and `vz.CPCUpgradeEligible` for that line.

On `https://www.verizon.com/digital/nsa/secure/ui/cpc/#/dataselectorperks` it reads localStorage entries for `evolv:cpc-iphone` and `evolv:cpc-upgrade-eligible` and sets remoteContext entries for `vz.CPCIPhone` and `vz.CPCUpgradeEligible`.