import { createRepositoryDocumentStore } from "./repository-document-store.js";
import { createRepositoryModel } from "./repository-model.js";
import { createBusinessObjectStore } from "../model/business-object-store.js";
import { createBusinessObjectRepresentationStore } from "../model/business-object-representation-store.js";
import { createBusinessRelationStore } from "../model/business-relation-store.js";
import { createIdentityOriginStore } from "../model/identity-origin-store.js";
import { createBusinessObjectExternalIdentityStore } from "../model/business-object-external-identity-store.js";
//#region src/repository/repository-scope-store.js
function createRepositoryScopeStore() {
	const repositories = /* @__PURE__ */ new Map();
	function requireRepositoryId(repositoryId) {
		if (typeof repositoryId !== "string" || repositoryId.length === 0) throw new Error("Repository scope requires a repositoryId");
	}
	function createRepository(repositoryId) {
		requireRepositoryId(repositoryId);
		if (repositories.has(repositoryId)) throw new Error(`Repository scope already exists: ${repositoryId}`);
		const repository = {
			id: repositoryId,
			model: createRepositoryModel(),
			documents: createRepositoryDocumentStore(),
			businessObjectStore: createBusinessObjectStore(),
			businessObjectRepresentationStore: createBusinessObjectRepresentationStore(),
			businessRelationStore: createBusinessRelationStore(),
			identityOriginStore: createIdentityOriginStore(),
			businessObjectExternalIdentityStore: createBusinessObjectExternalIdentityStore(),
			repositoryContext: null,
			workspace: {
				mode: "memory",
				directoryHandle: null,
				name: null,
				workspaceId: null,
				createdAt: null,
				savedAt: null,
				fileHandles: /* @__PURE__ */ new Map(),
				loadedBusinessModelState: null
			}
		};
		repositories.set(repositoryId, repository);
		return repository;
	}
	function getRepository(repositoryId) {
		requireRepositoryId(repositoryId);
		return repositories.get(repositoryId) || null;
	}
	function getRepositories() {
		return Array.from(repositories.values());
	}
	function removeRepository(repositoryId) {
		requireRepositoryId(repositoryId);
		return repositories.delete(repositoryId);
	}
	function clear() {
		repositories.clear();
	}
	return {
		createRepository,
		getRepository,
		getRepositories,
		removeRepository,
		clear
	};
}
//#endregion
export { createRepositoryScopeStore };

//# sourceMappingURL=repository-scope-store.js.map