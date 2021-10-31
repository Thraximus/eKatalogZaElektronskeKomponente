export const StorageConfig = 
{
    storageDestination:'../storage/',
    photo:
    {
        maxAge: 1000*60*60*24,
        destination: '../storage/img',
        normalSizeDestination: '../storage/img/normal',
        urlPrefix:'/assets/photos',
        categoryUrlPrefix:'/assets/categoryPhoto',
        maxSize: 4*1024*1024,
        resize:
        {
            thumb:
            {
                width: 120,
                height:100,
                destination: '../storage/img/thumb'
            },
            small:
            {
                width: 320,
                height:240,
                destination: '../storage/img/small'
            },
            categoryPhoto:
            {
                width: 320,
                height:240,
                destination: '../storage/img/categoryPhoto'
            }
            
            
        }
    }
};