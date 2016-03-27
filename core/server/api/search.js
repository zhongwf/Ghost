// # Posts API
// RESTful API for the Post resource
var searchEngine         = require('../searchEngine'),
 utils           = require('./utils'),
 pipeline        = require('../utils/pipeline');

/**
 * ### Posts API Methods
 *
 * **See:** [API Methods](index.js.html#api%20methods)
 */

search = {

    /**
     * ## Read
     * Find a post, by ID, UUID, or Slug
     *
     * @public
     * @param {Object} options
     * @return {Promise<Post>} Post
     */
    search: function search(req, res) {
        var tasks;
         

        // Push all of our tasks into a `tasks` array in the correct order
        tasks = [ 
            //utils.handlePublicPermissions('post', 'read')
			//,modelQuery
        ];
		//Q='query=default:洪秀柱'
		
	

        return searchEngine.getDateFromSearchEngine('BlogSearch',req.query.Q,function(a, b){
			return res.json(b);
		});

		
		
		//return {posts: "123"};
        
		/*
        return pipeline(tasks, options).then(function formatResponse(result) {
            // @TODO make this a formatResponse task?
           
                return {posts: "123"};
            
 
        });
		*/
    }
};

module.exports = search;
