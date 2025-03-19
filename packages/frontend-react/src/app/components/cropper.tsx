// import Cropper from 'cropperjs';
// import { useEffect, useRef, useState } from 'react';
// import SvgIcon from './svg';

export const CropperView = ({
    image,
    // close,
    // callback,
}: {
    image: string;
    close: () => void;
    callback: (image: Blob) => void;
}) => {
    return <>{image}</>;
    // const [cropper, setCropper] = useState<Cropper>();
    // const imageRef = useRef<HTMLImageElement>(null); // Use a ref for the image element

    // const cropImage = () => {
    //     if (!cropper) return;
    //     cropper.getCroppedCanvas().toBlob((blob) => {
    //         if (blob) callback(blob); // Ensure blob is not null
    //     });
    // };

    // useEffect(() => {
    //     if (!imageRef.current) return;

    //     const _cropper = new Cropper(imageRef.current, {
    //         aspectRatio: 1,
    //         viewMode: 1,
    //         autoCropArea: 0.8,
    //         dragMode: 'move',
    //         cropBoxMovable: false,
    //         cropBoxResizable: false,
    //         zoomable: true,
    //         center: true,
    //         background: false,
    //         modal: true,
    //         minCropBoxHeight: 200,
    //         minCropBoxWidth: 200,
    //     });

    //     setCropper(_cropper);
    //     _cropper.replace(image);

    //     // Cleanup on unmount
    //     return () => {
    //         _cropper.destroy();
    //     };
    // }, [image]); // Dependency array includes image

    // return (
    //     <div className="p-2 flex flex-col gap-5">
    //         <img
    //             ref={imageRef}
    //             id="cropperContainer"
    //             className="w-[250px] h-[200px] object-contain"
    //             src={image} // Set initial image source
    //             alt="Cropper Image"
    //         />
    //         <div className="flex flex-row gap-2 items-center w-full justify-between">
    //             <button
    //                 type="button"
    //                 title="Zoom in"
    //                 className="flex gap-2 whitespace-nowrap bg-blue-400 items-center border-blue-600 border !text-white p-2 px-2.5 rounded-lg"
    //                 onClick={() => cropper?.zoom(0.1)}
    //             >
    //                 <SvgIcon path="/icons/svg/zoom-in.svg" className="w-5 h-5" />
    //             </button>
    //             <button
    //                 type="button"
    //                 title="Zoom out"
    //                 className="flex gap-2 whitespace-nowrap bg-blue-400 items-center border-blue-600 border !text-white p-2 px-2.5 rounded-lg"
    //                 onClick={() => cropper?.zoom(-0.1)}
    //             >
    //                 <SvgIcon path="/icons/svg/zoom-out.svg" className="w-5 h-5" />
    //             </button>
    //             <button
    //                 type="button"
    //                 title="Rotate left"
    //                 className="flex gap-2 whitespace-nowrap bg-blue-400 items-center border-blue-600 border !text-white p-2 px-2.5 rounded-lg"
    //                 onClick={() => cropper?.rotate(-45)}
    //             >
    //                 <SvgIcon path="/icons/svg/rotate.svg" className="w-5 h-5" />
    //             </button>
    //             <button
    //                 type="button"
    //                 title="Rotate right"
    //                 className="flex gap-2 whitespace-nowrap bg-blue-400 items-center border-blue-600 border !text-white p-2 px-2.5 rounded-lg"
    //                 onClick={() => cropper?.rotate(45)}
    //             >
    //                 <SvgIcon path="/icons/svg/rotate.svg" className="w-5 h-5 -scale-x-100" />
    //             </button>
    //         </div>
    //         <div className="flex justify-center gap-2 items-center">
    //             <button
    //                 type="button"
    //                 className="flex gap-2 h-fit whitespace-nowrap bg-blue-400 items-center border-blue-600 border !text-white p-1 px-3 rounded-lg"
    //                 onClick={cropImage}
    //             >
    //                 Save
    //             </button>
    //             <button
    //                 type="button"
    //                 className="flex gap-2 h-fit whitespace-nowrap bg-red-400 items-center border-red-600 border !text-white p-1 px-3 rounded-lg"
    //                 onClick={close}
    //             >
    //                 Cancel
    //             </button>
    //         </div>
    //     </div>
    // );
};
