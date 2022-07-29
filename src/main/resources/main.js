const libContext = require('/lib/xp/context');
const libNode = require('/lib/xp/node');
const libRepo = require('/lib/xp/repo');
const libTask = require('/lib/xp/task');
const libUtil  = require('/lib/util');


const toStr = libUtil.toStr;

const ALLTEXT_UPPERCASE_T = '_allText';
const ALLTEXT_LOWERCASE_T = '_alltext';

const REPO_ID_1 = `${app.name}.1`;
const INDEX_CONFIG = {
	configs: [{
		config: {
			decideByType: false,
			enabled: true,
			nGram: false,
			fulltext: false,
			includeInAllText: true,
			path: false,
			indexValueProcessors: [],
			languages: []
		},
		path: 'data'
	},{
		config: {
			decideByType: false,
			enabled: true,
			nGram: false,
			fulltext: true,
			includeInAllText: false,
			path: false,
			indexValueProcessors: [],
			languages: [
				'en'
			]
		},
		path: 'deep.nested.path'
	}], // configs
	default: 'none'
};
log.info(`INDEX_CONFIG:${toStr(INDEX_CONFIG)}`);

const LORUM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
const LORUM_ENGLISH = 'But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?';

const QUERY_PARAMS = {
	//count: -1, // BUG Highlight doesn't work when count is -1
	highlight: {
		//encoder: '' // Indicates if the snippet should be HTML encoded: default (no encoding) or html.
		fragmentSize: -1, // The size of the highlighted fragment in characters. Defaults to 100.
		//fragmenter: 'simple',
		//fragmenter: 'span',
		//noMatchSize: 10, // The amount of characters you want to return from the beginning of the property if there are no matching fragments to highlight. Defaults to 0 (nothing is returned).
		numberOfFragments: 1, // The maximum number of fragments to return. If numberOfFragments is 0, no fragments will be returned and fragmentSize will be ignored. Defaults to 5.
		//order: 'none', // Sorts highlighted fragments by score when set to score. Defaults to none - will be displayed in the same order in which fragments appear in the property.
		//order: 'score',
		postTag: '</b>',
		preTag: '<b>',
		properties: {
			//_allText: {}, // NOTICE: Uppercase T
			_alltext: {}, // NOTICE: Lowercase T
			data: {},
			'deep.nested.path': {}
		}//,
		// requireFieldMatch can be set to false which will cause any property
		// to be highlighted regardless of whether its value matches the query.
		// The default behaviour is true, meaning that only properties that
		// match the query will be highlighted.
		//requireFieldMatch: false,
		//tagsSchema: 'styled' // Set to styled to use the built-in tag schema.
	},
	//query: "fulltext('data', 'dolor')"
	//query: `fulltext('${ALLTEXT_UPPERCASE_T}', 'dolor')`
	//query: `fulltext('${ALLTEXT_LOWERCASE_T}', 'dolor')`
	query: {
		boolean: {
			//must: [{
			should: [{ // Highlight works for should on _alltext
				//fulltext: {
				stemmed: { // Highlight works
					fields: [
						//ALLTEXT_UPPERCASE_T
						//ALLTEXT_LOWERCASE_T // Highlight works
						//'deep.nested.path' // Highlight works
						//'*' // Even this works
						'deep.*.path' // Highlight works
						//'deep.*' // Highlight works
						//'*.path' // Highlight works
						//'*.nested.*'  // Highlight works
					],
					//query: 'dolor'//,
					query: 'ideas', // Highlight works with stemming
					//operator: 'AND'
					language: 'en'
				} // fulltext
			}] // must/should
		} // boolean
	}, // query
	//query: "fulltext('_allText', 'dolor') OR fulltext('data', 'dolor')"
	//query: "ngram('_allText', 'dolor') OR ngram('data', 'dolor')"
	//query: "fulltext('_allText', 'dolor~1') OR fulltext('data', 'dolor~1')"
};
log.info(`QUERY_PARAMS:${toStr(QUERY_PARAMS)}`);


function task() {
  libContext.run({
    repository: 'system-repo',
    branch: 'master',
    principals: ['role:system.admin']
  }, () => {
		const createRepoParams1 = {
			id: REPO_ID_1
		};
		log.debug(`createRepoParams1:${toStr(createRepoParams1)}`);
    try {
      libRepo.create(createRepoParams1);
    } catch (e) {
      if (e.class.name !== 'com.enonic.xp.repo.impl.repository.RepositoryAlreadyExistException') {
        log.error(`e.class.name:${toStr(e.class.name)} e.message:${toStr(e.message)}`, e);
      }
    }
    const connectParams1 = {
      branch: 'master',
      repoId: REPO_ID_1,
      principals: ['role:system.admin']
    };
    log.debug(`connectParams1:${toStr(connectParams1)}`);
    const connection1 = libNode.connect(connectParams1);

		try {
			connection1.delete('/1');
		} catch (e) {
			log.error(`e.class.name:${toStr(e.class.name)} e.message:${toStr(e.message)}`, e);
		}

    const createNodeParams1 = {
			_indexConfig: INDEX_CONFIG,
			_name: '1',
			//_path: '/',
			data: LORUM,
			deep: {
				nested: {
					path: LORUM_ENGLISH
				}
			}
		};
		log.debug(`createNodeParams1:${toStr(createNodeParams1)}`);
		try {
			connection1.create(createNodeParams1);
		} catch (e) {
			if (e.class.name !== 'com.enonic.xp.node.NodeAlreadyExistAtPathException') {
				log.error(`e.class.name:${toStr(e.class.name)} e.message:${toStr(e.message)}`, e);
			}
		}
    connection1.refresh();

    const queryRes1 = connection1.query(QUERY_PARAMS);
		log.debug(`queryRes1:${toStr(queryRes1)}`);

		queryRes1.hits = queryRes1.hits.map((hit) => {
			const node = connection1.get(hit.id);
			return {
				highlight: hit.highlight,
				id: hit.id,
				node: {
					data: node.data,
					nested: node.nested
				},
				score: hit.score
			};
		});
		log.info(`queryRes1:${toStr(queryRes1)}`);
  }); // run
} // task


libTask.submit({
	description: '',
	task
});
