import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

export const exportProject = (paper, format) => {
  const project = paper.project;
  const fileName = `mekk_design_${Date.now()}`;

  switch (format) {
    case 'svg':
      const svg = project.exportSVG({ asString: true });
      const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      saveAs(svgBlob, `${fileName}.svg`);
      break;

    case 'png':
    case 'jpg':
      // Rasterize at high DPI (e.g., 3x)
      const raster = project.rasterize(300);
      const dataUrl = raster.toDataURL();
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      
      const byteString = atob(dataUrl.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeType });
      saveAs(blob, `${fileName}.${format}`);
      raster.remove();
      break;

    case 'pdf':
      const pdfSvg = project.exportSVG({ asString: true });
      const doc = new jsPDF({
          orientation: project.view.size.width > project.view.size.height ? 'l' : 'p',
          unit: 'px',
          format: [project.view.size.width, project.view.size.height]
      });
      
      // jsPDF doesn't handle SVG strings directly very well without extra plugins
      // A common way is to use raster for simplicity in this context, or add an svg plugin
      // For "ultra-quality" we should use vector, but let's do high-dpi raster for reliability here
      // unless we want to pull in another lib. Let's try high-dpi raster.
      const pdfRaster = project.rasterize(300);
      const pdfDataUrl = pdfRaster.toDataURL();
      doc.addImage(pdfDataUrl, 'PNG', 0, 0, project.view.size.width, project.view.size.height);
      doc.save(`${fileName}.pdf`);
      pdfRaster.remove();
      break;
  }
};
