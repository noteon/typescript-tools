
module.exports=[
    {
        caption:"for",
        docHTML:"for loop", 
        snippet:
`for (var \${2:i} = 0; \$2 < \${1:Things}.length; \$2\${3:++}) { 
     \${4:\$1[\$2]} 
};`,
         meta:"snippet"
    },
    { caption:"if",
      docHTML:"if condition", 
      snippet:"if (${1:true}) {${2}};",
      meta:"snippet"
    },
    {
        caption:"ifelse",
        docHTML:"if else", 
        snippet:
`if (\${1:true}) {
    \${2}
} else {
    \${3}
}`, 
       meta:"snippet"
    },
]
