import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

export const exportProject = (paper, format) => {
  const project = paper.project;
  const fileName = `mekk_design_${Date.now()}`;

  switch (format) {
    case 'svg': {
      const svg = project.exportSVG({ asString: true });
      const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      saveAs(svgBlob, `${fileName}.svg`);
      break;
    }

    case 'png': {
      const raster = project.rasterize(3);
      const dataUrl = raster.toDataURL('image/png');
      const byteString = atob(dataUrl.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i += 1) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: 'image/png' });
      saveAs(blob, `${fileName}.png`);
      raster.remove();
      break;
    }

    case 'jpg':
    case 'webp': {
      const mimeType = format === 'webp' ? 'image/webp' : 'image/jpeg';
      const raster = project.rasterize(3);
      const dataUrl = raster.toDataURL(mimeType);
      const byteString = atob(dataUrl.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i += 1) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeType });
      saveAs(blob, `${fileName}.${format}`);
      raster.remove();
      break;
    }

    case 'pdf': {
      const doc = new jsPDF({
        orientation: project.view.size.width > project.view.size.height ? 'l' : 'p',
        unit: 'px',
        format: [project.view.size.width, project.view.size.height],
      });
      const pdfRaster = project.rasterize(3);
      const pdfDataUrl = pdfRaster.toDataURL('image/png');
      doc.addImage(pdfDataUrl, 'PNG', 0, 0, project.view.size.width, project.view.size.height);
      doc.save(`${fileName}.pdf`);
      pdfRaster.remove();
      break;
    }

    default:
      break;
  }
};
