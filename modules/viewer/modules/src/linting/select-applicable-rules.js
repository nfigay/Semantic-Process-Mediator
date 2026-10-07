//#region src/linting/select-applicable-rules.js
function selectApplicableRules(catalog, { coc, maturity } = {}) {
	return Object.values(catalog).filter((rule) => {
		const cocMatches = rule.cocs === "*" || rule.cocs.includes(coc);
		const maturityMatches = rule.maturities === "*" || rule.maturities.includes(maturity);
		return cocMatches && maturityMatches;
	});
}
//#endregion
export { selectApplicableRules };

//# sourceMappingURL=select-applicable-rules.js.map