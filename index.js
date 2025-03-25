import { writeFileSync } from 'node:fs';


const url = new URL("https://mercado.carrefour.com.br/api/graphql");

url.searchParams.set("operationName", "ProductsQuery");

const variables = {
  isPharmacy: false,
  first: 100,
  after: "0",
  sort: "score_desc",
  term: "",
  selectedFacets: [
    { key: "category-1", value: "bebidas" },
    { key: "category-1", value: "4599" },
    { key: "channel", value: JSON.stringify({ salesChannel: 2, regionId: "v2.7BA3167303A7C6998E4A6BF241DCB3C1" })},
    { key: "locale", value: "pt-BR" },
    { key: "region-id", value: "v2.7BA3167303A7C6998E4A6BF241DCB3C1" },
  ],
};
url.searchParams.set("variables", JSON.stringify(variables));

const response = await fetch(url.toString());

if (response.status !== 200) {
	throw new Error("Request failed. Status code: " + response.status)
}

const outputJson = await response.json()
var output = outputJson
	.data
	.search
	.products
	.edges
	.map(value => {
		const node = value.node
		return {
			name: node.name,
			price: node.offers.lowPrice,
			normalPrice: node.offers.offers[0].listPrice,
			image: node.image[0].url
		}
	})

const totalCount = outputJson
	.data
	.search
	.products
	.pageInfo
	.totalCount
async function getProducts(index) {
	const newUrl = new URL("https://mercado.carrefour.com.br/api/graphql");
	newUrl.searchParams.set("operationName", "ProductsQuery");

	const variables = {
		isPharmacy: false,
		first: 100,
		after: ((index * 100) - 1).toString(),
		sort: "score_desc",
		term: "",
		selectedFacets: [
			{ key: "category-1", value: "bebidas" },
			{ key: "category-1", value: "4599" },
			{ key: "channel", value: JSON.stringify({ salesChannel: 2, regionId: "v2.7BA3167303A7C6998E4A6BF241DCB3C1" })},
			{ key: "locale", value: "pt-BR" },
			{ key: "region-id", value: "v2.7BA3167303A7C6998E4A6BF241DCB3C1" },
		],
	};
	newUrl.searchParams.set("variables", JSON.stringify(variables));
	const response = await fetch(newUrl.toString());
	if (response.status !== 200) {
		throw new Error("Request failed. Status code: " + response.status)
	}
	const outputJson = await response.json()
	const newProducts = outputJson
		.data
		.search
		.products
		.edges
		.map(value => {
			const node = value.node
			return {
				name: node.name,
				price: node.offers.lowPrice,
				normalPrice: node.offers.offers[0].listPrice,
				image: node.image[0].url
			}
		})
	output = output.concat(newProducts);
}
const toRun = []
for (var i = 1; i < totalCount / 100; i++) {
	toRun.push(
		getProducts(i)
	)
}
// Run all functions at same time for better time performance
await Promise.all(toRun)
writeFileSync("output.json", JSON.stringify(output))
