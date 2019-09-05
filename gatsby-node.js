const path = require("path");
// const basePath = "";

const { createFilePath } = require("gatsby-source-filesystem");

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type === "Mdx") {
    const value = createFilePath({ node, getNode });

    createNodeField({
      name: "slug",
      node,
      value
    });
  }
};

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions;

  const result = await graphql(`
    query {
      allMdx {
        edges {
          node {
            id
            fields {
              slug
            }
            frontmatter {
              slug
            }
            parent {
              ... on File {
                modifiedTime(formatString: "MM/DD/YYYY")
              }
            }
          }
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panicOnBuild('🚨  ERROR: Loading "createPages" query');
  }

  const pages = result.data.allMdx.edges;

  pages.forEach(({ node }, index) => {
    createPage({
      // prefer custom slug over generated
      path: node.frontmatter.slug || node.fields.slug,
      component: path.resolve(`./src/templates/page.js`),
      context: { id: node.id, modifiedTime: node.parent.modifiedTime }
    });
  });
};
