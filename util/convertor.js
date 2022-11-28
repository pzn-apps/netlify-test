///USAGE EXAMPLE
///  console.log( convertObsidianLinks( source, 'https://github.com/pzn-apps/pzn-apps.github.io/blob/main/img/', true ) )
/////

export function convertObsidianLinks( text, imagePath, removePathFromLinks ){
    let result = convertObsidianImageLinks( text, imagePath )

    let links = result.match(/(?<=\[\[)(.*?)(?=\]\])/g)
    links.map(link=>{
        let parts = link.split('|')
        if( !parts[0] ) return
        let label = ( parts[1] || parts[0].split('/').pop() )
        let filename = removePathFromLinks ? parts[0].split('/').pop() : parts[0]

        result = result.replace( 
            '[[' + link + ']]',
            '[' + label + '](' + filename.replace( new RegExp(' ','g'),'%20') + '.md' + ')' 
        )
    })
    return result
}

function convertObsidianImageLinks( text, path ){
    const labelSubstitute = 'unknown'
    let result = text
    let images = result.match(/(?<=!\[\[)(.*?)(?=\]\])/g)
    images.map(image=>{
        let parts = image.split('|')
        if( !parts[0] ) return

        let label = ( parts[1] || labelSubstitute )
        let filename = parts[0].replace(/\\/g, "/").split('/').pop()

        result = result.replace( 
            '![[' + image + ']]',
            '[' + label + '](' + path + filename + ')' 
        )
    })
    return result
}

