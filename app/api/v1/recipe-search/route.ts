import { apiTryCatch } from "@app/api/utils/apiTryCatch";
import { ActionError, ApiSuccess } from "@lib/api-response";
import algoliasearch from 'algoliasearch';
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/v1/recipe-search:
 *   get:
 *     summary: Search for recipes
 *     operationId: SearchRecipe
 *     description: Provides a list of recipes based on search criteria, including query terms, locale, pagination, and filters.
 *     tags:
 *       - Recipes
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Query term for the search.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Page number for pagination, zero-based.
 *       - in: query
 *         name: itemsPerPage
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of items per page.
 *       - in: query
 *         name: course
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filters recipes by course. Possible values include 'Main course', 'Dessert', 'Snacks', etc.
 *       - in: query
 *         name: season
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filters recipes by season. Possible values include 'All', 'Autumn', 'Winter', 'Summer', 'Spring'.
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filters recipes by difficulty. Possible values include 'easy', 'medium', 'difficult'.
 *       - in: query
 *         name: specialDiet
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filters recipes by dietary preference. Possible values include 'Gluten Free', 'Dairy Free', 'Vegetarian', 'Kid Friendly', 'Healthy', 'Vegan', 'Pescatarian'.
 *       - in: query
 *         name: mainIngredients
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filters recipes by dietary preference. Possible values include 'Vegetables', 'Dairy and eggs', 'Beef', 'Poultry', 'Seafood', 'Fruits', 'Pork', 'Grains legumes nuts', 'Chocolate', 'Dairy', 'Eggs', 'Pasta', 'Lamb & Game', 'Lamb and game', 'Nuts'.
 *     responses:
 *       '200':
 *         description: Successfully retrieved list of recipes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function GET( req: NextRequest ) {
  const { searchParams } = new URL( req.url );
  const params = Object.fromEntries( searchParams );
  const {
    q = '',
    page = '0',
    itemsPerPage = '5',
    course = [] as string[], 
    season = [] as string[], 
    difficulty = [] as string[], 
    specialDiet = [] as string[],
    mainIngredients = [] as string[]
  } = params || {};

  return await apiTryCatch( async () => {
    // Initialize the Algolia client with your Application ID and Admin API Key
    const client = algoliasearch( 'T6VYOQ9C3T', 'e696423da02e4ea52b4b0538773f5038' );
  
    // Initialize an index
    const index = client.initIndex( 'Preprod_Recipes' );

    // Parse page and itemsPerPage to integers with reasonable defaults
    const pageNumber = parseInt( page, 10 ) || 0;
    const hitsPerPage = parseInt( itemsPerPage, 10 ) || 5;

    // Algolia search options;
    const searchOptions: Record<string, any> = {
      hitsPerPage,
      page: pageNumber,
      attributesToHighlight: [],
      facets: ['*'],
      facetFilters: []
    };

    if (course) {
      searchOptions.facetFilters.push(...(Array.isArray(course) ? course : [course]).map(value => `course:${value}`));
    }
    if (season) {
      searchOptions.facetFilters.push(...(Array.isArray(season) ? season : [season]).map(value => `season:${value}`));
    }
    if (difficulty) {
      searchOptions.facetFilters.push(...(Array.isArray(difficulty) ? difficulty : [difficulty]).map(value => `difficulty:${value}`));
    }
    if (specialDiet) {
      searchOptions.facetFilters.push(...(Array.isArray(specialDiet) ? specialDiet : [specialDiet]).map(value => `specialDiet:${value}`));
    }
    if (mainIngredients) {
      searchOptions.facetFilters.push(...(Array.isArray(mainIngredients) ? mainIngredients : [mainIngredients]).map(value => `mainIngredients:${value}`));
    }

    // Grab all facets from algolia
    const { facets, hits } = await index.search( q, searchOptions );

    return NextResponse.json(
      {
        status: 'OK',
        message: `${ hits.length } recipes found`,
        data: {
          hits,
          facets,
        }
      } as ApiSuccess<any>,
      {
        status: 200
      }
    );
  } );
}