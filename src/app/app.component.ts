import { environment } from './../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import * as Constants from '@ui-workspace/shared';
import { SubmitDialogComponent } from '@ui-workspace/shared';
import { I18nService } from './shared/services/i18n.service';
import { Component, Inject, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Form, Messages, Section } from '@ui-workspace/modules';
import { AbstractControl } from '@angular/forms';
import * as moment from 'moment';
import loadFormHooks from '@ui-workspace/loadHooks';
import { SegmentDynamicLoaderService } from './shared/services/segment-dynamic-loader.service';
import { MatSidenav } from '@angular/material/sidenav';
import { CoreStateMachineService, ProfileRequestorService, ResetPropagationService, SidenavService } from '@ui-workspace/services';
import * as Handlebars from 'handlebars/dist/handlebars.min.js';
import { HttpClient } from '@angular/common/http';

declare var $j: any;

@Component({
  selector: 'app-wm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  @ViewChild('sidenav', { static: true }) public sidenav!: MatSidenav;
  sideContent: any;
  requestSection: any;
  isReady = false;
  isValidLoad = false;
  isSuccessfullySubmitted = false;
  visible = 'visible';
  showProfileFormContent: boolean;
  showCommentFormContent: boolean;
  form!: Form;
  sections!: Section[];
  sectionsController!: { [key: string]: AbstractControl };
  numberOfComments = 0;
  submitResponse: any;
  creationDate!: string;
  isSubmitting: any = {
    hrSubmit: false
  };
  SectionDetails: any;
  hrRequestIsSubmitted: boolean = false;
  isPrintResponse = false;
  noError = true;
  message = [];
  public feedBackIcon: string = '';
  showFlagOptions: boolean = false;
  downloadingFile: boolean;

  constructor(
    public profileRequestorService: ProfileRequestorService,
    public stateMachineService: CoreStateMachineService,
    public coreStateMachineService: CoreStateMachineService,
    public i18n: I18nService,
    public segmentDynamicLoader: SegmentDynamicLoaderService,
    public resetPropagator: ResetPropagationService,
    private sidenavService: SidenavService,
    public dialog: MatDialog,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.showProfileFormContent = true;
    this.showCommentFormContent = true;
    this.submitResponse = null;
    this.stateMachineService.environment = environment;
    this.stateMachineService.dispatch(Constants.STATE_MACHINE_ACTION_LOAD_FORM).then((form: any) => {
        if (form instanceof Form) {
          this.setFormData(form);
        } else if (form instanceof Messages) {
          this.errorResponse(form);
        }
        this.isReady = true;
        this.noError = true;
        this.profileRequestorService.getSectionDetails().subscribe(data => {
          this.SectionDetails = data;
          const [sect] = this.form.sections;
          this.requestSection = sect;
        });
      }
    );
  }


  /*  generateEmail(): void {
      const subject: string = this.form.sections?.[0]?.body?.details?.requestTitle; // Email subject
      const htmlBody: string = decodeURIComponent(this.form.sections?.[0]?.body?.details?.requestDetails); // Email body
      const attachments: {
        name: string;
        contentBase64: string;
        contentType: string
      }[] = this.form.sections?.[0]?.body?.details.attachments.map((attachment) => {
        return {
          name: attachment.fileName,
          contentBase64: attachment.fileContents,
          contentType: attachment.fileType
        };
      });

      const boundary: string = '----=_NextPartBoundary';
      let emailContent: string = `
      X-Unsent: 1
  Subject: ${subject}
  MIME-Version: 1.0
  Content-Type: multipart/mixed; boundary="${boundary}"

  --${boundary}
  Content-Type: text/html; charset="utf-8"

  ${htmlBody}
  `.trim();

      attachments.forEach((attachment) => {
        emailContent += `

  --${boundary}
  Content-Type: ${attachment.contentType}; name="${attachment.name}"
  Content-Disposition: attachment; filename="${attachment.name}"
  Content-Transfer-Encoding: base64

  ${attachment.contentBase64}
  `;
      });

      emailContent += `--${boundary}--`.trim();

      const blob: Blob = new Blob([emailContent], { type: 'message/rfc822' });
      const link: HTMLAnchorElement = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'email.eml';
      link.click();
    }*/
  private processEmailHtml(htmlBody: string): string {
    // Create a temporary DOM element to parse and modify HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlBody, 'text/html');
    
    // Process all tables - preserve original styling from editor
    const tables = doc.querySelectorAll('table');
    tables.forEach((table: HTMLTableElement) => {
      // Only add table-level styles if not already present
      if (!table.style.borderCollapse) {
        table.style.borderCollapse = 'collapse';
      }
      if (!table.style.width) {
        table.style.width = '100%';
      }
      if (!table.style.tableLayout) {
        table.style.tableLayout = 'fixed';
      }
      if (!table.style.wordWrap) {
        table.style.wordWrap = 'break-word';
      }
      if (!table.style.boxSizing) {
        table.style.boxSizing = 'border-box';
      }
      // Do not add table-level border - it stacks with first column in email clients and creates thick left edge.
      // Check first row for background color
      const firstRow = table.querySelector('tr:first-child');
      let firstRowHasBackground = false;
      if (firstRow) {
        const firstRowCells = firstRow.querySelectorAll('td, th');
        firstRowCells.forEach((cell: HTMLElement) => {
          const cellStyle = cell.getAttribute('style') || '';
          const bg = cell.style.background || cell.style.backgroundColor || 
                     cellStyle.match(/background[^:;]*:\s*([^;]+)/)?.[1]?.trim();
          if (bg && bg !== 'none' && bg !== 'transparent' && !bg.includes('rgba(0,0,0,0)')) {
            firstRowHasBackground = true;
          }
        });
      }
      
      // Process all cells - match editor format: uniform 1px solid #bbb on every cell
      const allCells = table.querySelectorAll('td, th');
      const editorBorder = '1px solid #bbb';
      allCells.forEach((cell: HTMLElement) => {
        const isFirstRow = cell.closest('tr') === firstRow;
        // Always override borders to match editor (avoids inconsistent thickness from pasted/editor content)
        cell.style.border = editorBorder;
        cell.style.borderTop = editorBorder;
        cell.style.borderRight = editorBorder;
        cell.style.borderBottom = editorBorder;
        cell.style.borderLeft = editorBorder;
        if (!cell.style.padding && !cell.getAttribute('style')?.includes('padding')) {
          cell.style.padding = '8px';
        }
        if (!cell.style.wordBreak && !cell.getAttribute('style')?.includes('word-break')) {
          cell.style.wordBreak = 'break-word';
        }
        
        // Apply purple header to first row if it doesn't have a background color
        // (matching editor's default CSS: table tr:first-child { background: #4f008c; })
        if (isFirstRow && !firstRowHasBackground) {
          const existingBg = cell.style.background || cell.style.backgroundColor || 
                           cell.getAttribute('style')?.match(/background[^:;]*:\s*[^;]+/)?.[0];
          if (!existingBg || existingBg.includes('none') || existingBg.includes('transparent')) {
            cell.style.background = '#4f008c';
            cell.style.color = 'white';
          }
        }
      });
    });
    
    // Process all images - center small images
    const images = doc.querySelectorAll('img');
    images.forEach((img: HTMLImageElement) => {
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.boxSizing = 'border-box';
      
      // Check if image is small (less than 200px width) and center it
      const width = img.getAttribute('width') || img.style.width;
      const widthValue = width ? parseInt(width.toString().replace('px', '').replace('%', '')) : null;
      
      // Check actual image dimensions if available
      const naturalWidth = (img as any).naturalWidth;
      const isSmall = (!widthValue || widthValue < 200) && (!naturalWidth || naturalWidth < 200);
      
      if (isSmall) {
        // Wrap in centered div
        const wrapper = doc.createElement('div');
        wrapper.style.textAlign = 'center';
        wrapper.style.margin = '10px 0';
        wrapper.style.display = 'block';
        img.parentNode?.insertBefore(wrapper, img);
        wrapper.appendChild(img);
        img.style.display = 'inline-block';
      } else {
        img.style.display = 'block';
      }
    });
    
    // Add font family to body
    const body = doc.body;
    if (body) {
      body.style.fontFamily = '"STC_Forward", Arial, sans-serif';
      body.style.wordBreak = 'break-word';
      body.style.padding = '0';
      body.style.margin = '0';
    }
    
    return doc.body.innerHTML;
  }

  async generateEmail(): Promise<void> {
    // const from: string = 'sender@example.com'; // Sender email
    // const to: string = null; // Recipient email
    const subject = this.form.sections?.[0]?.body?.details?.requestTitle; // Email subject
    let htmlBody = decodeURIComponent(this.form.sections?.[0]?.body?.details?.requestDetails); // Email body

    // Process HTML to add inline styles for email compatibility
    htmlBody = this.processEmailHtml(htmlBody);

    const attachments = await this.downloadAllAttachments();
    const lang = this.i18n.getLanguage();
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    const boundary: string = '----=_NextPartBoundary';
    
    // CSS styles as fallback (some email clients support style tags)
    const emailStyles = `
    <style>
      body, div {
        font-family: "STC_Forward", Arial, sans-serif;
        word-break: break-word;
        padding: 0;
        margin: 0;
      }
      img {
        max-width: 100%;
        height: auto;
        display: block;
        box-sizing: border-box;
      }
      table {
        border-collapse: collapse;
        width: 100%;
        table-layout: fixed;
        word-wrap: break-word;
        box-sizing: border-box;
      }
      table td, table th {
        border: 1px solid #bbb !important;
        border-width: 1px !important;
        word-break: break-word;
        padding: 8px;
      }
      iframe, div, section, article {
        max-width: 100%;
        box-sizing: border-box;
        word-wrap: break-word;
      }
      * {
        font-family: "STC_Forward", Arial, sans-serif;
      }
    </style>
    `;
    
    let emailContent: string = `
    X-Unsent: 1
Subject: ${subject}
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="${boundary}"

--${boundary}
Content-Type: text/html; charset="utf-8"

<!DOCTYPE html>
<html dir="${dir}">
<head>
<meta charset="utf-8">
${emailStyles}
</head>
<body>
${htmlBody}
</body>
</html>
`.trim();

    attachments.forEach((attachment) => {
      emailContent += `

--${boundary}
Content-Type: ${attachment.mimeType}; name="${attachment.fileName}"
Content-Disposition: attachment; filename="${attachment.fileName}"
Content-Transfer-Encoding: base64

${attachment.fileContents}
`;
    });

    emailContent += `--${boundary}--`.trim();

    const blob: Blob = new Blob([emailContent], { type: 'message/rfc822' });
    const link: HTMLAnchorElement = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'email.eml';
    link.click();
  }

  downloadingFiles: boolean = false;

  async downloadAllAttachments() {
    if (!this.downloadingFiles) {

      this.downloadingFiles = true;
      try {
        const section = this.form?.sections?.[0]?.body?.details;
        if (section && 'attachments' in section) {
          for (const file of section.attachments) {
            await this.downloadFile(file);
          }
          return section.attachments;
        }
        return [];
      } catch (error) {
        console.error(error);
        return [];
      } finally {
        this.downloadingFiles = false;
      }
    }
  }

  async downloadFile(field: any) {
    if (field && 'attachmentId' in field) {
      const responseObject = await this.coreStateMachineService.dispatch(Constants.STATE_MACHINE_ACTION_LOAD_FILE, field.attachmentId);
      // const responseObject = {
      //   'fileName': 'common_words_in_commits (1) (1).png',
      //   'mimeType': 'image\/png',
      //   'fileContents': 'iVBORw0KGgoAAAANSUhEUgAAB9AAAASwCAYAAACjJNG+AAAAOXRFWHRTb2Z0d2FyZQBNYXRwbG90\r\nbGliIHZlcnNpb24zLjguMCwgaHR0cHM6Ly9tYXRwbG90bGliLm9yZy81sbWrAAAACXBIWXMAAB7C\r\nAAAewgFu0HU+AAD48klEQVR4nOzdeZgU1f0+7GeQfRFUMIogCIrgjgJiAMF9jaho1Ghc45ZoolHR\r\nrGqicY0aidEvaoLGNcYlGhONEdxFQXEHFdwAMQKKsgkM9PsH7\/RvBmYD0RmS+76uua7qrlOfOtVd\r\nXQzz9DlVUigUCgEAAAAAAACA\/3EN6roDAAAAAAAAAFAfCNABAAAAAAAAIAJ0AAAAAAAAAEgiQAcA\r\nAAAAAACAJAJ0AAAAAAAAAEgiQAcAAAAAAACAJAJ0AAAAAAAAAEgiQAcAAAAAAACAJAJ0AAAAAAAA\r\nAEgiQAcAAAAAAACAJAJ0AAAAAAAAAEgiQAcAAAAAAACAJAJ0AAAAAAAAAEgiQAcAAAAAAACAJAJ0\r\nAAAAAAAAAEgiQAcAAAAAAACAJAJ0AAAAAAAAAEgiQAcAAAAAAACAJAJ0AAAAAAAAAEgiQAcAAAAA\r\nAACAJAJ0AAAAAAAAAEgiQAcAAAAAAACAJAJ0AAAAAAAAAEgiQAcAAAAAAACAJAJ0AAAAAAAAAEgi\r\nQAcAAAAAAACAJAJ0AAAAAAAAAEgiQAcAAAAAAACAJAJ0AAAAAAAAAEgiQAcAAIDVzmOPPZaSkpKU\r\nlJRk0KBBdd2dJMl7771X7FPnzp3rujv8lzj66KOL59WIESPqujsAAMD\/AAE6AAD12qBBg4p\/OC\/7\r\nuf\/++1eoxplnnrlcjfPOO++r6fB\/kcWLF+df\/\/pXzjzzzPTt2zedO3dOixYt0qxZs6y\/\/vrZfvvt\r\nc8opp+S+++7LokWL6rq7rKb69etX\/FwOHTq0VttceOGFFT7PV1xxRa22O\/nkk+td6Ez98MEHH+Ta\r\na6\/NgQcemM022yzt2rVLo0aNstZaa2XjjTfOgQcemEsuuSTvvPNOXXeVOlA+xC\/7ufrqq1eoxu9\/\r\n\/\/vlahx99NFfTYcBAIAvRYAOAMBq56abbqp128WLF+e22277Cnvz9fi6R5vefvvt2WyzzbLHHnvk\r\nt7\/9bZ577rm8\/\/77mTdvXr744ot89NFHef7553PNNdfkgAMOyPrrr59f\/\/rXmTdv3lfeN\/677Ljj\r\njsXlJ554olbbLNtuZbYbOHBgrbbhv9vkyZNz\/PHHp2vXrvn+97+fe++9N+PHj8+MGTNSWlqaWbNm\r\nZdKkSbn33ntzzjnnpGvXrtlll13y3HPP1XXXKWfEiBFfeyi9Ir+LJMnNN9\/8FfUEAABY1RrWdQcA\r\nAGBF\/f3vf8+nn36atdZaq8a2jzzySKZNm\/Y19Oq\/wxdffJFjjjkmd9xxR4Xn27Rpkz59+mTddddN\r\n06ZN89FHH+Xtt9\/Om2++mSSZOXNmfvnLX+bZZ5\/NP\/7xj7roOqupHXfcMRdffHGS5IUXXsjcuXPT\r\nokWLKtsvXrw4zz77bIXnnnrqqRQKhZSUlFS53cyZMzN+\/PgK++V\/26hRozJkyJB8+umnxedKSkqy\r\n1VZbpWvXrllnnXUye\/bsTJs2LWPHjs3cuXOTJCNHjkzfvn0zevTobL\/99nXVferYiy++mNdffz2b\r\nb755jW3ffPPNjBkz5mvoFQAAsCoYgQ4AwGpjs802S5IsXLhwuYC3KuVHfJVtT+UWLlyY3XffvcJr\r\n27dv3zzyyCOZMWNGHn744fz5z3\/O9ddfnwceeCATJkzIpEmT8stf\/jKtWrVKEiPQWWH9+\/fPGmus\r\nkSQpLS1dLhxf1osvvpjZs2cnSTp27JhkaTj++uuvV7vdk08+mUKhkCRp1KhRdthhhy\/bdZbRuXPn\r\nFAqFFAqFvPfee3XdnWo98MAD2WOPPYrheYsWLfKLX\/wi06ZNy0svvZS77747w4cPz+23357HHnss\r\nM2fOzN\/\/\/vf079+\/WGP+\/Pl11f3\/KSNGjCieV\/VhyvPyv0vUdlR5+dHqfhcBAID6T4AOAMBq47DD\r\nDkujRo2S1O6P1p9\/\/nnuu+++JMk222yTLbfc8qvs3mrvzDPPzJNPPll8fM455+TZZ5\/NrrvuWgw4\r\nl9WlS5ecf\/75eeedd3LQQQd9XV3lv0irVq2yzTbbFB\/XNB17+fVnnnnmSm3Xq1evNG\/efAV7yn+L\r\nd955J0ceeWQWLVqUJOnUqVNeeOGF\/OpXv8o3vvGNSrdp0qRJ9tlnnzz55JO59957azUDCv+d9txz\r\nz7Rr1y5Jcuutt2bJkiXVtl+yZEluueWWJEm7du2y1157feV9BAAAvhwBOgAAq422bdsW\/\/A8evTo\r\nvP3229W2v+uuu4ojBI866qivvH+rs6eeeirDhg0rPj755JNz0UUX1Xr7tm3b5q677srPfvazr6J7\r\n\/Jdbkfugl61v0aJFvve97xWD8BUJ0N3\/\/H\/bCSeckFmzZiVJWrZsmZEjR2bTTTet9fb7779\/xo4d\r\nW5wBgf8tjRo1ymGHHZYkmTp1ah599NFq248aNSqTJ09OknznO99Jw4bupggAAPWdAB0AgNXKkUce\r\nWVyuaRR62fqGDRvmO9\/5zgrvq1Ao5K677sphhx2Wrl27pmXLlmnZsmW6du2a73znO\/nrX\/9anBK6\r\nJnPmzMl1112XffbZJxtuuGGaN2+epk2bpkOHDtlmm21ywAEH5A9\/+EMmTpxYYbvzzjsvJSUl2Wmn\r\nnYrPPf744ykpKVnup3Pnzit8jGXK7kGdLJ0W+7LLLlupOrvttlu16+fMmZOrr746e+yxRzp06JCm\r\nTZtmrbXWyhZbbJFTTjklzz33XK32U\/64y7zwwgs5\/vjj061bt7Ro0SJrrrlmBgwYkJtvvrnS9+nR\r\nRx\/NkCFD0rVr1zRt2jTrrbdeDjjggAqj8Kty9NFHF\/c\/YsSIJMknn3ySSy+9NL17907btm3TpEmT\r\ndOvWLWeccUZmzJixXI0PPvggZ599drbeeuu0bt06a665Znr37p2rrrqqODK2NlbVeTpo0KDiMT32\r\n2GPFY7rkkkuKx9SsWbN06dIlxx13XF577bVa97Em5QP05557LgsXLqy0XaFQyFNPPZVk6e0Fmjdv\r\nnj59+iRJte\/b7Nmz89JLL1W6v2WNHj06p5xySjbffPOstdZaxc\/pnnvumd\/\/\/vfF+2BXp+xzW1JS\r\nkvPOOy\/J0um+b7zxxuy+++7ZcMMN07hx45SUlFToV5kpU6bk7LPPzuabb56WLVtmrbXWylZbbZWf\r\n\/exn+eCDD2rc\/7LGjBmTU045Jdtuu23WWmutNGrUKGuvvXa6deuW\/v3758c\/\/nEefvjhLz0l+Xvv\r\nvVer61Fln98333wzp512Wnr06JGWLVtmzTXXzNZbb52f\/OQnlX5+VtbYsWMrBJ6\/+c1v0qVLlxWu\r\n06VLl3Tt2rXaNl\/VuTRv3rz84Q9\/yIABA7LeeuulcePG6dy5c0444YS8\/\/77y9WYMWNGLrzwwvTq\r\n1SvrrLNOWrRokS233DLnn39+jX2o6j0dNWpUDjvssHTp0qV4Hd99993zwAMPLFdj8eLFuffee7PX\r\nXnulU6dOxdfhiCOOyKuvvlrja1DZ9XbZdcccc0zxuZtuuqnSfyMHDRpU475qa2V+F1l2uxUxefLk\r\n\/PrXv86AAQPSvn37NGnSJGuvvXZ69uyZM888M2+99Vat6ixatCi33HJLDjzwwHTp0iUtW7ZMkyZN\r\n0r59+2y11VbZZ5998tvf\/rbG6\/uquKZ8\/PHH+dOf\/pSjjjoqPXv2zNprr51GjRqlTZs26d69e445\r\n5pg8\/PDDK\/Q6Jclrr72Wk08+OZtsskmaN2+etm3bplevXrnooouK15IRI0YUz4va3hZgzJgxOf30\r\n07PNNtukXbt2ady4cdZbb70MHDgwl1xySfF2EDWZMWNGLr\/88uy6665p3759mjZtmubNm6dTp07Z\r\nbrvtcthhh+VPf\/pTpk6dusLHDgDAKlQAAIB6bODAgYUkhSSFa6+9trBgwYLC2muvXUhS6Ny5c2HJ\r\nkiWVbvfuu+8WSkpKCkkK++yzT6FQKBQOOeSQYq1zzz232v2+9dZbhZ49exbbV\/Wz3XbbFSZOnFht\r\nrWeeeaawwQYb1Fir7GfRokXFbc8999xab9epU6cVem3LvP\/++8XXKknhggsuWKk6NXnggQcK6623\r\nXo3H8Z3vfKcwd+7camuVb18oFAoXXnhhYY011qiy5pFHHlk8V+bMmVP41re+VWXbkpKSwhVXXFHt\r\n\/o866qhi+z\/96U+FMWPGFDp27FhlzY4dOxbefffd4vbDhw8vNGnSpMr2\/fr1K8yZM6fG13RVnqfl\r\nP2ujRo0qPPXUU9Wet2ussUZh+PDhNfaxNmbMmFHhHHzyyScrbffKK68U25x33nmFQqFQ+MUvflF8\r\n7u233650u4ceeqhCvz\/77LPl2syZM6fCNaKqn\/XXX7\/wj3\/8o9rjKf+5PffccwtvvPFGYfPNN6+0\r\n3rhx4ypse+eddxbWXHPNKve\/5pprFu69997CqFGjis8NHDiw0n4sWrSocMIJJ9T6GvKzn\/2s2uOq\r\nybvvvlur69Gyn99rr7222s\/DOuusUxgzZsyX6luZY489tli3devWNV5rVsZXeS69\/fbbhS222KLK\r\nmq1bty688MILxe3vv\/\/+QuvWratsv+mmmxY++uijKve\/7HtaWlpaOOWUU6o9rp\/\/\/OfF7f\/zn\/8U\r\n+vbtW2XbRo0aFe66665qX4Nlr7dVravpp6rPSW2U38\/ZZ59dKBQKxc90ixYtCrNnz650uzlz5hRa\r\ntmxZSFLYfPPNC4VCoXD22WcXax111FHV7nfx4sWFX\/ziF4WmTZtWe2wNGzYs\/PSnP63yd6JCoVB4\r\n8803Cz169Kj161XZ9XRVXVN+97vfVftvdvmfnXfeuTBjxoxqX6cyl1xySaFRo0bVfuaefvrpwp\/+\r\n9KdavweffPJJYciQITX2s02bNjWey\/fdd19hrbXWqtVxb7DBBrU6ZgAAvhrmjQIAYLXSuHHjfPvb\r\n3851112X9957L0888USl0zGXH3W8oiO+xo8fn4EDB2b69OnF57bccstss802KSkpybhx44qj5l54\r\n4YX069cvTzzxRLp167ZcrcmTJ2ePPfbI7Nmzkyyd+rV3797ZeOON07x588ydOzfvvfdeXn755Xz+\r\n+efLbd+nT5\/84Ac\/yNSpU4v3c2\/fvn0OOOCA5dqus846K3ScZUaNGlVhhPLKjNavyZ133pnDDz88\r\nixcvTpKsscYa6d+\/fzbeeOPMmTMnTz75ZD788MMkyW233ZZ33303I0eOTNOmTWusfe211xanjt9u\r\nu+2y5ZZbplAo5Mknn8w777yTZOn5sOmmm+acc87JkCFD8vDDD6dx48bp379\/unTpks8\/\/zyPPvpo\r\nZs6cmUKhkB\/\/+Mfp3bt3+vfvX+P+J0+enLPOOiszZszIN77xjey4445p06ZN3n777TzxxBNZsmRJ\r\nJk+enL322iuvvfZabr\/99pxwwglJku7du6dXr15p3Lhxxo4dm1deeSVJ8vTTT+e0007L9ddfX+V+\r\nV+V5uqzXXnstP\/nJTzJnzpysu+66GTBgQNZZZ51MnTo1I0eOzPz587N48eKcdNJJ2WKLLbLDDjvU\r\nWLM666yzTjbffPPiqMcnnnii0te+\/DTsAwYMSJIK7Z544olsvPHG1W7Xs2fPrLnmmhXWz5s3Lzvv\r\nvHOef\/754nPt27fPgAED0rJly0ycODFPPfVUFi9enGnTpmW\/\/fbL7bffnoMOOqjGY5s5c2b23HPP\r\nfPDBB2natGkGDBiQTp06Zfbs2Rk9enSFtvfff3++853vVPicDBgwIF27ds1nn32Wxx57LDNmzMi3\r\nv\/3t\/OY3v6lx32eeeWaGDx9efLzBBhukT58+adu2bQqFQmbOnJk33ngjb775Zo21viojRozIySef\r\nnCTZdNNN06tXrzRr1iwTJkzI008\/Xeznt771rYwfPz5t2rT5UvsbOXJkcXnw4MHFWwCsKl\/lufT5\r\n559n7733zttvv502bdpk0KBBadeuXSZPnpyRI0dm4cKF+eyzz7LHHntk4sSJefHFFzNkyJAsWrQo\r\nnTp1yg477JCWLVvm9ddfz7PPPptk6cj\/I444Io888kitju+nP\/1pfv\/736dBgwbZYYcdsummm+aL\r\nL77IqFGjMm3atCTJBRdckB49emT\/\/ffPbrvtlldeeSXNmzfPwIED06FDh0yfPj3\/\/ve\/M2fOnCxa\r\ntChHHHFEevbsWeOI\/srsuuuuadmyZSZMmFCcWaB79+7ZZZddlmu7ySabrHD96nz3u9\/NOeeck7lz\r\n5+buu++u9FYxd999d+bMmZNkxX8XWbx4cQ455JDcfffdxefWX3\/9bL\/99ll33XUzZ86cPPfcc5k0\r\naVJKS0vzm9\/8JtOnT6\/wmS8ze\/bs7LrrrsWp5Bs0aJCePXsWZ3yYN29epk6dmpdffrnaGR9W1TXl\r\nww8\/LF7nunTpkh49eqRdu3Zp2rRpZs2alVdffTWvv\/56kqWf2V133TWjR49OkyZNqqx5xRVX5Oyz\r\nzy4+btq0aXbaaad06NAhM2bMKJ6j++67b0477bRq+1fmo48+ys4775zx48cXn+vRo0e22WabtGrV\r\nKh9\/\/HGeeuqpzJgxI7Nmzcq3v\/3t\/PnPf87hhx++XK2xY8fmoIMOSmlpaZKkWbNm6du3bzp37pwm\r\nTZrk888\/z6RJk\/Lqq69m3rx5teofAABfoToM7wEAoEbLjkAvFJaO6C577thjj610u4033rg4Imj+\r\n\/PmFQqF2I9AXLFhQ2HrrrYvt2rVrV3j44YeXa\/fwww8X2rZtW2y37bbbFhYuXLhcux\/96EfFNgMG\r\nDChMnTq10v0uWrSo8NhjjxUOP\/zwQmlp6XLrazPadGUdd9xxxdrrrrvuKq1dKBQKEydOLI7AS1Lo\r\n1atX4a233qrQZvHixYXf\/va3hQYNGhTbnXrqqVXWTLlRWo0bNy5ssMEGhaeffrpCm9LS0sKZZ55Z\r\nYXTYeeedV0hSGDRoUOH999+v0H7WrFmFnXbaqdh+0KBBVe6\/\/GjExo0bF0pKSgoXXHBBhdkDCoVC\r\n4amnniq0atWq2PbCCy8stGzZstC6devC\/fffv1zdq6++uti2pKSk8M4771S6\/1V9nhYKFT9rTZo0\r\nKayxxhqF3\/72t8sd0wcffFBhBOxOO+1U5eu0Ir7\/\/e8Xa+6xxx6Vtvn2t79dyP8\/arVs5PDnn39e\r\nHMlY1UjC\/v37F2v\/+Mc\/Xm79ySefXFy\/xhprFK644orC4sWLK7R56623Ctttt12x3Zprrlnl+1N+\r\n1HDDhg0LSQoHHXRQYfr06RXaLV68uPh+TJ8+vcJ71bNnz+U+JwsWLCgMHTq0eN5Vd02YPn16cd9r\r\nrLFGYcSIEVWOTv3www8LV199deGGG26odH1trcwI9CZNmhTatWtX+Oc\/\/7lcu8cff7zCaPzzzz\/\/\r\nS\/Vv8uTJFfZ9zTXXfKl6lfkqz6Wy9\/wHP\/jBciPnx48fX2jfvn2x7VlnnVXo0KFDoXHjxoUbbrhh\r\nuff+7rvvLp4fSQqPPfZYpfsv\/542atSoUFJSUth8880Lr732WoV28+fPLxx22GHFtptssklxpPq3\r\nv\/3t5UYQf\/jhhxVmZTj66KOrfE2rG4FeZkVGFK+MykagT5kypfhv1s4771zpdrvsskshSaFBgwbF\r\nf\/9rOwK9\/Owa6667buHOO+9c7lwqFAqFu+66q8IsA3feeedyba688sri+s0226wwYcKESve5ZMmS\r\nwvPPP184+eSTCx988EGFdavymnLjjTcWhg0bVpgyZUqVx\/\/yyy8XevXqVez3r3\/96yrbvvbaaxWu\r\nifvss0\/h448\/rtBm7ty5hZNOOql43anpPVi8eHGF3wm23XbbSmfCmD9\/fuG8884rzqLSokWLSj\/P\r\ngwcPLtYaMmRI4ZNPPql0v1988UXhwQcfLJx44olVHi8AAF89AToAAPVaZQF6oVAodOvWrRg8zJs3\r\nr8I2Tz\/9dHGbE044ofh8bQL0P\/7xjxXCgrFjx1bZt+eff75CAHHTTTct16Z8SFLV9NK18VUG6GV\/\r\n4K8pNF5ZRx55ZLF+ly5dCp9++mmVba+44opi2wYNGlQZKpUPwZo1a1Z44403Km23ePHi5aas3Xzz\r\nzYtfqljWBx98UHxPS0pKCh9++GGl7ZadNrhsOvHKXHTRRRXaNmjQoMqwqlAoFHbfffdi24svvrjS\r\nNqv6PC0UKn7WkhT+7\/\/+r8qar776ajEsqO51WhF33HFHcd+tWrWq9Isk66+\/fiFJYfvtt6\/w\/Lbb\r\nbltIUthoo42W22b+\/PkVwpK\/\/e1vFdZPnDixwhc3rr766ir7+MknnxQ6d+5cbHvMMcdU2m7ZWy\/s\r\nvvvulQZf5f3kJz8ptl9vvfWWC9vLKwuBqrsmPPDAA8X1hx9+eLX7XlVWNkB\/+eWXq2z7+9\/\/vti2\r\ne\/fuX6p\/Tz75ZIV9V\/c5XBlfx7lUXdB8++23V2ibpPDnP\/+5yvblp+I+6aSTKm1T\/j0tC3L\/85\/\/\r\nVNp29uzZhXXWWadC+912263Kc7\/8l+Fatmy53Jd1ytTXAL1QKBR222234nV92cB58uTJxfNh9913\r\nLz5fmwD93XffLX4xqFWrVoXx48dX279HH320WLNHjx7LBdvlpyB\/5JFHVvDol6qLa8qsWbOKt35Z\r\nf\/31K\/13oVAoFA466KBi33r16lVYsGBBlTUPPvjgCudoVe\/BzTffXGyzzTbbVDlNf5lf\/vKX1X6e\r\nyj4bTZo0qbEWAAB1r0EAAGA19N3vfjfJ0ilty6Y2L3PzzTcXl1d0ytT\/+7\/\/Ky6fdNJJ2W677aps\r\n27t37xx\/\/PHFx9dee+1ybcpPy96uXbsV6svX5ZNPPikuf9npkZc1a9as3HnnncXHl112WbX7+NGP\r\nfpTNN988SbJkyZJKp6Jd1kknnZQePXpUuq5BgwY5+OCDKzx30UUXVTk1fMeOHfPNb34zSVIoFPLC\r\nCy\/UuP9vfOMb+clPflLl+kMOOaTC4\/3337\/S2w6UOfTQQ4vLY8aMqbTNqj5Pl7XlllsWp5mvzBZb\r\nbJHevXsnqf3rVJPyr8ns2bMzbty4Cuvffvvt4hTRZdO3lyl7\/O6772bKlCkV1j3\/\/PNZsGBBkqSk\r\npGS5ba+\/\/vosWbIkSbLVVlvllFNOqbKPa621Vi655JLi49tuuy2fffZZjcd21VVXpUGDqv\/7vWTJ\r\nkvzpT38qPj7vvPPStm3bKttffPHFadmyZbX7XB2uPUlywgknZKuttqpy\/ZFHHpmGDZfefe7NN9+s\r\n9FYXtVX+Wpes+uvdV30uNW7cuMI2y9p\/\/\/0rTHG97bbb5ogjjqiyfW2uNcv62c9+lnXXXbfSdS1b\r\ntsw+++xT4bnLL7+8ynN\/hx12yIYbbpgkmTNnTiZMmFCrPtQnZb9jLFmyJLfcckuFdbfcckvxfFjR\r\n30V+97vfFac4Hzp0aLp3715t+5133jl77LFHkqW391j2+rkqrgd1cU1p3bp18ZY106ZNyxtvvLFc\r\nm08++SR\/+9vfio8vvfTSNG7cuMqav\/3tb6u9Hpe54oorisvDhg2r8Zr7k5\/8pHhNuf3224vvfZmy\r\n16958+Y11gIAoO4J0AEAWC1997vfTUlJSZKKgfmCBQuKgW3Xrl3Tr1+\/WtecM2dOxo4dW3x87LHH\r\n1rjN9773veLymDFjMnfu3Arry8KBJLnmmmtq3ZevU9n92ZOs8j\/qPvPMM8Xwcp111sl+++1XbfsG\r\nDRpUeN1HjRpV4z6GDBlS7fotttiiuNysWbPstddetW7\/7rvv1rj\/b33rW9X+sX6jjTZKixYtio9X\r\npL+V7f+rOE+XteyXDirTs2fP4vJ7771XY\/uarLfeehXuUfzkk09WWF\/+8bIhePn7oC+7Xfn7n2+5\r\n5ZZZa621Kqwvf0\/sY445pnhdqcoBBxyQtddeO8nS603ZvaSrstVWW1X5BY8y48ePz0cffZQkadiw\r\nYYVgszKtW7fO4MGDq21T\/tpz9913F+vXNzWda61atSreG7tQKOSDDz5Y6X2Vv9Ylq\/5691WfSzvu\r\nuGOV4XWy9J7P5e8j\/mWvNZVZkZqbbLJJtV+OWNk+1CcHHnhg8Tz685\/\/XGFd2e8mrVq1KobAtfWP\r\nf\/yjuFzT9aDMzjvvXFx+6qmnKqwrfz34wx\/+sEJ9qazGqrymfPzxx7n\/\/vtzySWX5Jxzzsmpp56a\r\nU045pfhT\/t+7l156abntn3nmmSxatCjJ0nvEDxo0qNr9dezYMTvuuGO1baZNm1bc1wYbbFDh35iq\r\nNG3aNDvssEOS5LPPPstrr71WYX3Z6\/fpp5\/mtttuq7EeAAB1q2FddwAAAFZGp06dsuOOO+bxxx\/P\r\nI488ko8++ijrrbde7r\/\/\/syaNSvJ\/xulXlsvv\/xyccRXy5Yta\/zDf5Jss802adGiRebOnZvFixfn\r\n5ZdfLo5gTpaOPn700UeTLB25969\/\/SuHH354dtttt3Tu3HmF+vdVadWqVXF5zpw5q7R2+VFw22+\/\r\nfXEkaXXKf+lh3LhxKRQK1QZRZSPWq1I+MO3WrVuNfSjfvjajXWvaf7J0pGtZaL3ZZpt9qf1\/Fefp\r\nsrbccssaa66zzjrF5dqMwq6NHXfcMW+\/\/XaSpcH36aefXlxXFoSXlJQsF2aUD9SfeOKJHHbYYctt\r\nV1a\/vEKhUCGQqc0Xbho1apQ+ffrkoYceSpK8+OKL2XPPPatsX93sAGXK96F79+5p3bp1jdv07ds3\r\nt956a5Xrt99++3Tq1Cnvv\/9+Jk+enM033zxHHXVUvvWtb6Vv375p1qxZjfv4Onyd51r5a12yaq93\r\nX8e5VJtrTfnrx5e91iyrdevW2WCDDVbZ\/lemD\/VN8+bNM2TIkNx0000ZP358xowZk969e2fMmDEZ\r\nP358kqVfOmjevHmta86cOTNvvfVW8fGVV15Z45cxklQYnT158uQK6w455JDceOONSZLhw4dnzJgx\r\nOeqoo7LHHnvUOLq9zKq+przxxhs5++yz889\/\/rP4b1pNZsyYsdxz5T93vXv3rtVr1bt37zz22GNV\r\nri\/\/ZZZCoVDtbBLlTZo0qbg8efLkCv8+H3LIIfnNb36TJDniiCNyxx135JBDDsnOO++c9ddfv1b1\r\nAQD4+gjQAQBYbR155JF5\/PHHs3jx4tx6660544wziiO+SkpKVjhAnz59enG5Y8eOtZris0GDBunY\r\nsWNx6tll\/7h73HHH5V\/\/+lf++te\/Jkkef\/zxPP7440mS9u3bZ8CAAdl5551zwAEH1Nk0y2UjIJMU\r\nv3ywqpR\/TTt16lSrbcp\/sWDhwoWZPXt21lxzzSrb1xQ2lg\/MaxNMlm9fNqqtOitac0X6W9n+v4rz\r\ndFm1OaZGjRpV28+VseOOOxZDnieffLLClyfKgvDNNtuswjmbLJ1Gf+ONN87EiRMrBOaLFy+uEIQs\r\nO3X+Z599VqHvK3OO1vRa1uZzXf49LT\/KszodO3asdn2jRo1yyy23ZJ999snnn3+eTz75JFdeeWWu\r\nvPLKNG7cONtuu2123HHH7LPPPhkwYECtQqevwtd5ri173qzK693XcS59ldea0tLSGmuv6v0v235V\r\nXUe+bkceeWRuuummJEtHnffu3ftL3Uqm7FYVZVZmxPinn35a4fFuu+2W008\/PVdeeWWSpV9OK\/uC\r\nW9u2bdOvX78MGjQoQ4YMqfLasiqvKQ8\/\/HAGDx5cnKGmtpadRSKp+Lnp0KFDrerU9EWQDz\/8sMLy\r\nyswgtOx78LOf\/SyPP\/54nn766RQKhTzwwAN54IEHkiydqWbAgAHZddddM3jw4Gp\/5wEA4OthCncA\r\nAFZbBx98cHFU180335yPP\/64OJKvf\/\/+6dKlywrVKz8asfyU2zUp33bZP+42aNAgf\/nLXzJixIjl\r\nRgp\/+OGHufPOO3PiiSemffv2+d73vrfcPXq\/DuUDnMruL\/plrMxrumy7yv5gXt6KBH9fRUi4ojW\/\r\nbB++ivN0WXUVppYfIT5z5szi+Th16tTi9M7LTt9epmxU+vjx44uByosvvljh9Vp2BPqyI5BX5hyt\r\n6bWszajM8v2o7UjV2vS1f\/\/+efnll3PsscdWaL9w4cKMHj06l156aQYOHJju3bvn3nvvrdV+V7Wv\r\n81xbdtaPVXm9+zrOpa\/7WlPf9l9f7bTTTsUvvtxxxx2ZO3du7rjjjiRLvxBT05Tiy1oVM3pU9oWI\r\nK664Ivfff\/9ys4\/MmDEjf\/vb33L66aenU6dOGTJkSN5\/\/\/1K666Ka8r06dNzyCGHFMPzjTbaKJdc\r\nckmefvrpfPjhh5k3b16WLFmSQqGQQqGQc889t7jtsvcVT76a6+dX8R40b948o0aNypVXXlnhVgvJ\r\n0tsX3HzzzTnyyCOz\/vrr56yzzsr8+fO\/dB8AAFh5AnQAAFZbrVq1yv77758keeWVV3L22WcX\/2C5\r\noiO+kor3w63pHtHllW+77BTBydIQ4aijjsrLL7+ciRMn5sYbb8xRRx1VIeAvLS3NjTfemD59+lQY\r\njfp1KD8d9scff7xK7mddZmVe02XbVfaa\/i\/7qs7T+qBz584VRmCXjSYvm7UhqTpAL3u+UCgU74Ne\r\nfjR69+7dl7t\/9LL3wF6Zc3RVvJbl+zFv3rwV7kN1OnfunBtvvDHTp0\/Pv\/\/97\/zyl7\/MTjvtVCHY\r\nf+utt3LggQfmiiuuWLGOr2Y6dOhQYWT4c889t8pq15dzia9fSUlJjjjiiCRLw+hTTjml+CWe7373\r\nuyv8RYLy4W6bNm2KQfKK\/IwYMaLS2t\/61rfy9NNPZ8qUKbnlllty4oknVphqv1Ao5J577sl2221X\r\nYRr58r7sNeX6668vBtQ9e\/bMK6+8kqFDh+ab3\/xm1l9\/\/TRr1qzCa1bTF0vKv16r6vpZvub++++\/\r\nUu\/B0UcfvVzdRo0a5bTTTsvEiRPz6quv5pprrsmhhx5aYUT8vHnzcvnll2ennXYSogMA1CEBOgAA\r\nq7XyQXnZH4ybNm2agw8+eIVrlZ9qefLkySkUCjVus2TJkgr3Gm3btm217bt27Zpjjz02I0aMyKRJ\r\nk\/LWW2\/lzDPPLE5jO2nSpJx\/\/vkr3PcvY6eddqrwx+rbbrttldUu\/5p+8MEHtdqm\/Mi3xo0bC5WW\r\n8XWcp3Wp\/CjxsgC8fBBe0wj0qrZbdvr2ZOkU0+WnB1+Zc3RVvJYr8zlZ9h7HNWnWrFl22WWXnH\/+\r\n+Rk5cmRmzpyZu+++O1tvvXWxzU9+8pNMnTp1hequbnbeeefi8t\/+9rdaB241qS\/nEnWjst9Fln2+\r\ntr7xjW8Ul2fNmvWVfKlugw02yOGHH57rrrsur7\/+eiZPnpxf\/\/rXxeB45syZ+fGPf1xtjZW9pjz6\r\n6KPF5Z\/\/\/OfLfflkWVWNhi9T\/nMzZcqUatuWqek6V\/49ePvtt2tVc0VtscUW+f73v5\/bb789U6ZM\r\nybhx43LccccV1z\/33HMrNXU8AACrhgAdAIDV2q677pr27dtXeG7w4MG1uvfqsrbeeuusscYaSZZO\r\nCfrqq6\/WuM3LL79cHMm0xhprVPjDcW1ssskmueyyy\/KrX\/2q+Nz999+\/XLuvcircTp06Za+99io+\r\n\/r\/\/+79VFir17NmzuPz8889n8eLFNW7z9NNPV9j+f2Ua4Nqqi\/P061RdgN6pU6cq78\/brVu3Yujx\r\nxBNPpFAoVDiXlp2+PVn6udpmm22Kj5955pka+1daWprnn3+++HjbbbetcZualO\/DhAkTajV98OjR\r\no7\/UPps1a5YDDzwwo0aNynrrrZdk6TTMDz\/88JeqW9+dfPLJxeVZs2blj3\/84yqpW1\/Opf9Vdf3v\r\nxKabbpo+ffpUeG777bdPt27dVrjW+uuvX2Emjn\/9619fun816dChQ37+85\/n+uuvr7DfFblHeW2v\r\nKeXvL7755ptXW3Px4sUVruOVKf+5Gzt2bK2+VDZmzJhq1\/ft27e4\/Prrr9c6mP8yttlmm9xwww05\r\n4YQTis9V9vsgAABfDwE6AACrtTXWWCPf+c53Kjy3MiO+kqVT8Pbq1av4uKopUMv705\/+VFzu06fP\r\nCt2Turx99923uPyf\/\/xnufVNmzYtLi9atGil9lGdc845p7j8wQcf5Oyzz16pOo888kiFx9\/85jfT\r\npEmTJEvve\/rggw9Wu32hUMhNN91UfFx+tChL1eV5+nUoH3R\/+OGHee655zJhwoQkVY8+L9OvX78k\r\nS78w8Oyzz2bmzJmV1i2v\/Dl200031Ri+3H\/\/\/cW6TZs2zQ477FBt+9ro0aNHMfwvLS0t3j+5Kp99\r\n9ln+9re\/fen9Jslaa61V4Z7IlV1\/\/pv07t27wnv+05\/+dKVuW\/HOO+9k0qRJFZ6rD+fS\/6qv+t\/I\r\n2lj2d4+V\/V0kSfbZZ5\/i8lVXXVWrUHhVKP+7yKJFi\/LJJ5+scI2arikNGvy\/P0XW9GW9++67Lx99\r\n9FG1bb75zW8WZ3\/48MMP89hjj1XbfvLkycXbfFRlo402So8ePYqPr7rqqmrbr0o1\/T4IAMDXQ4AO\r\nAMBq72c\/+1nGjBlT\/Nljjz1WutaJJ55YXL7mmmvyyiuvVNl23Lhxue6664qPTzrppOXalN0HtSbl\r\np\/stP51zmXXWWae4\/FVMsTxgwIB8\/\/vfLz7+\/e9\/n1\/84he13n7GjBk56KCDcuGFF1Z4vk2bNjnk\r\nkEOKj88666xq72d6zTXX5OWXX06y9I\/sxx9\/fK378L9kVZ+n9cmmm25aHL2YJBdccEExPKopQC9b\r\nv3jx4lx00UXF57t06ZIOHTpUus3xxx9fDHRefPHFDB8+vMr6n332WYYOHVp8fNhhh63UbBfLatCg\r\nQY455pji4\/PPP7\/aa8c555yTOXPmVFuz\/JcHalLT9ee\/zfDhw7PmmmsmWXp\/5Z133nmFpmm+5557\r\n0qtXr+Wm0a8P59L\/qq\/638jaOOaYYyr8LlLZPbBr64wzzijONDJ27NgVurVLZYHzyvwu0qBBg6y9\r\n9trFx6vqmtKlS5ficnVfBJo+fXpOP\/30Gve1zjrrZL\/99is+Hjp0aBYuXFhl+zPPPLNWs+GU\/yLh\r\n7373u\/z73\/+ucZsyy74HCxYsqPGaXeZ\/7XoMAFBfCdABAFjttWnTJr169Sr+lP3ReWUcfvjhxemt\r\nFy5cmD322COjRo1art2jjz6aPffcszjSbdttt81hhx22XLsNN9wwJ5xwQh577LEq\/2A7evTonHLK\r\nKcXHe++993JtunTpUhw1\/P7771eY9ndVufLKKyuMGrvgggvSv3\/\/jBw5ssq+v\/POOzn33HPTpUuX\r\n3H333ZW2Offcc4v3OH3rrbeyxx575J133qnQZsmSJRk2bFhOO+204nM\/+MEPstFGG33Jo\/rvtKrP\r\n0\/qmfFD+97\/\/vdLnK1P+Pujlt6vs\/udlunbtWuELCaecckquueaaLFmypEK7SZMmZffddy+OOl5z\r\nzTVX6EsmNfnxj39cDAGnTZuW3XffPRMnTqzQZuHChTnnnHNy3XXXpXHjxtXWGzZsWLbZZpv84Q9\/\r\nyLRp0yptM3v27Jx99tkZO3ZskqUzenyZLyCtLrp27ZqbbropDRs2TJK8++672XbbbXPeeedVOeJz\r\nwYIF+cc\/\/pEBAwZkyJAh+fTTTyutWx\/Opf9FW265ZXH5ueeeq\/U96Fel5s2bV\/hdpHnz5itdq2vX\r\nrvn5z39efHz++efn6KOPrnIq8cWLF+ff\/\/53jjzyyEpvBbDDDjvksMMOyz\/+8Y8qw+Xx48dXGDW\/\r\nyy67FGeQSVbdNaX8COuLL744t9xyy3J1XnzxxQwcODCTJ0+u1Ywp5557bnEU+tixY3PggQcud+\/4\r\nefPm5eSTT85f\/vKXCsdVlSOOOKI4q0RpaWn22WefXHLJJcXboSxrzpw5uf3227Pzzjvn1FNPrbBu\r\n2rRp6dixY84444wqf38rFAp56KGH8stf\/rL4XGW\/DwIA8PVoWNcdAACA+qRx48a5\/fbbM3DgwEyf\r\nPj0fffRRdt5552y99dbF+2y+9NJLxVHSSbLuuuvm9ttvL\/7xtrz58+fn+uuvz\/XXX59WrVplm222\r\nyYYbbpgWLVpkxowZmTBhQt54441i+3bt2uW8885brk6DBg2y\/\/7759Zbb02S7LTTTtlzzz2z4YYb\r\nFr8wsPbaa+enP\/3plzr2f\/\/73znqqKNy1113JVl6P\/Jddtkla621Vvr06ZN11103TZo0yX\/+85+8\r\n9dZbefPNNyvUaNWq1XJ1u3TpkhtuuCGHH354Fi9enGeffTabbrppBgwYkK5du2bu3Ll58sknKwQD\r\nffv2zaWXXrrSx\/LfblWfp\/XNjjvuWDwHy7Rt2zbdu3evdruePXumZcuWy430q2r69jKXX355xo4d\r\nmzFjxqS0tDSnnHJKLr744vTv3z8tW7bMpEmT8sQTTxS\/SNKwYcPceOONq\/QLHu3atcv111+fgw8+\r\nOIsXL864cePSvXv3DBw4MF26dMnnn3+eUaNGZfr06WnUqFEuuOCCCiOYK\/Pyyy\/nBz\/4QU455ZR0\r\n7do1W2yxRdq2bZtFixblww8\/zDPPPFMhDDrnnHOqvMf8f5v9998\/\/\/znP3PwwQdn1qxZmTNnTs4\/\r\n\/\/z86le\/ytZbb52uXbtmnXXWyezZszNt2rSMGTOmwmvVoEGDSoO9+nAu\/S\/6xje+kX79+uXpp5\/O\r\nF198ka233jp77rln1l9\/\/eKsAF27ds3JJ59cxz2tvXPPPTfvvfde8bYmN910U2655Zb07Nkz3bt3\r\nT8uWLfP555\/n\/fffz8svv1y87pUfjV9m0aJFueOOO3LHHXekWbNm2WqrrdKlS5esueaa+fTTTzNp\r\n0qS88MILxfbNmjXL5ZdfvlydVXFNOfroo3PFFVfkrbfeyoIFC\/Ld7343v\/nNb7L11lunadOmee21\r\n14oB\/NZbb5099tijxt8Httxyy1x44YXFa+KDDz6YTp06ZaeddsoGG2yQmTNnZuTIkZk1a1batGmT\r\n008\/Peeee26SilPKl7fGGmvkL3\/5S3bbbbeMGzeu+AWmX\/3qV+nbt2823HDDNG7cOJ9++mneeuut\r\nvPHGG8Uvqw0ZMmS5erNmzcoVV1yRK664ImuvvXZ69uyZDTbYIE2aNMnHH3+cV155Je+++26xfbdu\r\n3fKjH\/2o2uMGAOCrI0AHAIBl9OjRI0899VQOPfTQjBs3LsnSPxqXDyPLbLvttvnLX\/6Srl27Vlqr\r\nfJg3e\/bsau+7ufXWW+eOO+5I+\/btK11\/0UUXZdSoUfnwww8zb9683HPPPRXWd+rU6UsF6MnSP5rf\r\neeed2W+\/\/XL++ecXR8B++umnefjhh6vcbv3118+Pf\/zj5UZdlTnkkEPSokWLfO9738t\/\/vOflJaW\r\nZtSoUZWOmj7ssMNyww03VLinLctbledpfVNZ4N2\/f\/+UlJRUu90aa6yRvn37LjfVbnUj0JOlI0dH\r\njhyZ4447Ln\/5y1+SJFOmTKn0XuTrr79+brzxxuy11141HcYKO+CAA\/LnP\/85J5xwQubMmZPFixdn\r\n5MiRGTlyZLFNq1atMmLEiApTK1em\/JdZCoVCJk6cuNyI9jKNGzfOz372swojH\/8X7LrrrnnppZdy\r\n\/vnn5+abb87ixYtTKBTy0ksv5aWXXqp0mwYNGmSvvfbKhRdeWJwForz6ci79L7r66quz00475fPP\r\nP8+sWbOWe80HDhy4WgXoJSUlGTFiRHr16pVf\/vKX+fTTT7N48eKMHTu2GDBXtk2\/fv2We7789WD+\r\n\/Pl57rnn8txzz1VaY6ONNsott9ySrbbaqsoaX+aa0qRJkzzwwAPZa6+9irPRjB8\/PuPHj6\/Qrl+\/\r\nfrnzzjtz\/fXXV7qPZZ111lkpLS3NL3\/5y5SWlmb+\/Pn5xz\/+UaHN+uuvn7\/+9a95\/fXXKz2uZa2z\r\nzjp5+umn8+Mf\/zg33HBDSktLM2\/evArX5GU1a9Ys2223XYXnGjVqlCZNmmTBggVJkk8++SSPPvpo\r\nlTUGDRqU22+\/vVaj7wEA+GoI0AEAoBLdunXL2LFj89e\/\/jV33313nn\/++Xz88cdJlo7k3X777XPQ\r\nQQdlyJAh1YZ6M2fOzBNPPJHHH388Y8aMydtvv53\/\/Oc\/+eKLL9K8efN06NAh2223XYYMGZL99tuv\r\nypFQSdKxY8e8\/PLLGTZsWP71r3\/lzTffzOzZs1NaWrpKj72kpCRHHHFEDj300Pz73\/\/Ov\/71rzz9\r\n9NOZNm1aZsyYkUKhkLXWWiudO3dO7969s+eee2b33Xevcer8fffdNxMnTswf\/\/jH\/P3vf8\/rr7+e\r\nGTNmpFmzZmnfvn122mmnHHnkkdl+++1X6fH8N1tV52l9s+WWW2bttdfOJ598Unyupunby7crH6B3\r\n6NChVqN7W7ZsmTvvvDOnnXZa\/vznP+exxx7Lhx9+mPnz56dt27bZYostsu++++bYY4\/9SkONww47\r\nLP3798\/VV1+dBx98MB988EEaNmyYjh07Zu+9985JJ52UjTbaKI899li1dc4444wMGTIkjzzySJ55\r\n5pm8+uqree+99\/L555+nQYMGadOmTXr06JGdd945Rx55ZDp16vSVHVN91qlTp\/zxj3\/Mueeem7\/\/\r\n\/e955JFHMmHChMyYMSOfffZZWrZsmbZt22brrbfON7\/5zXz7299Ohw4dqq1ZX86l\/zXbbrttXnnl\r\nlQwbNiwjR47MO++8U\/wiyurslFNOyVFHHZU\/\/\/nPeeSRR\/Lyyy9n+vTp+eKLL9KqVat06NAhm2++\r\neQYNGpS999670lkkXnrppYwePTqjRo3K888\/nzfffLP4ZbzmzZtnvfXWyzbbbJP99tsv3\/72tyud\r\n4nxVXlO6deuWcePG5Zprrsk999yTN998MwsXLsx6662XLbfcMt\/5zndy8MEHF2+zUFs\/+clPsu++\r\n++b3v\/99\/v3vf+fDDz9M8+bN07lz5wwZMiQnnHBC2rZtW+HLjG3atKm2ZrNmzXLttdfm7LPPzi23\r\n3JKRI0fmrbfeysyZM7NkyZK0bt06Xbp0ydZbb51ddtkle+65Z9Zcc80KNcqPgn\/yySfzwgsvZOLE\r\niZk+fXoWLlyYVq1apVOnTundu3cOOeSQ7Lrrrit03AAArHolhUKhUNedAAAAAAD4qh1++OG57bbb\r\nkiS33357Dj300DruEQAA9Y0AHQAAAAD4rzd37tx06NAhs2bNSpJMnDhxtbm9CQAAX5+q54cEAAAA\r\nAPgv8fOf\/7wYnvfu3Vt4DgBApQToAAAAAMBq669\/\/WvOOuusTJw4sdL1M2bMyPe\/\/\/1cddVVxefO\r\nOuusr6l3AACsbkzhDgAAAACstkaMGJFjjjkmSdKtW7dsueWWWWeddbJgwYK8++67ee6557JgwYJi\r\n+8MPPzy33HJLXXUXAIB6rmFddwAAAAAAYFV466238tZbb1W6bo011sgPfvCDXHHFFV9zrwAAWJ0Y\r\ngQ4AAAAArLYWLlyYRx55JA899FBefPHF\/Oc\/\/8mMGTMyb968rLXWWuncuXMGDRqUY489Nptuumld\r\ndxcAgHpOgA4AAAAAAAAASRrUdQcAAAAAAAAAoD4QoAMAAAAAAABABOgAAAAAAAAAkESADgAAAAAA\r\nAABJBOgAAAAAAAAAkESADgAAAAAAAABJBOgAAAAAAAAAkCRpWNcdoKIvvvgir776apKkXbt2adjQ\r\nWwQAAAAAAAD8bygtLc306dOTJFtuuWWaNm36te5fOlvPvPrqq+nTp09ddwMAAAAAAACgTj3\/\/PPp\r\n3bv317pPU7gDAAAAAAAAQIxAr3fatWtXXH7++eez\/vrr12FvAAAAAAAAAL4+06ZNK87YXT47\/boI\r\n0OuZ8vc8X3\/99dOhQ4c67A0AAAAAAABA3SifnX5dTOEOAAAAAAAAABGgAwAAAAAAAEASAToAAAAA\r\nAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEAS\r\nAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAA\r\nAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAA\r\nJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToA\r\nAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAA\r\nAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGg\r\nAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAA\r\nAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAECSpGFddwC+Lp3PebCuu8Bq4r2L96nr\r\nLgAAAAAAAFAHjEAHAAAAAAAAgAjQAQAAAAAAACCJAB0AAAAAAAAAkgjQAQAAAAAAACCJAB0AAAAA\r\nAAAAkgjQAQAAAAAAACBJ0rCuOwBA5Tqf82Bdd4HVxHsX71PXXQAAAAAAgP8KRqADAAAAAAAAQATo\r\nAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAA\r\nAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBE\r\ngA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAA\r\nAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAA\r\nSQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4A\r\nAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAA\r\nAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQTo\r\nAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAA\r\nAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBE\r\ngA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASephgD5jxoxceuml6devX9Zbb700adIk7du3\r\nz\/bbb5+zzjorzz77bI01HnrooRx44IHp0KFDmjRpkg4dOuTAAw\/MQw89VOt+zJs3L5dddln69OmT\r\ntddeOy1btkyPHj1y5pln5oMPPvgyhwgAAAAAAABAPdSwrjtQ3l133ZWTTz45M2fOrPD8tGnTMm3a\r\ntDz\/\/PN5++23c99991W6faFQyEknnZThw4dXeH7q1Km59957c++99+aEE07Iddddl5KSkir7MWnS\r\npOyzzz558803Kzw\/YcKETJgwITfccENuu+227L333it3oAAAAAAAAADUO\/UmQL\/55ptzzDHHZMmS\r\nJVl33XVz8sknp3\/\/\/ll77bXz0UcfZdKkSXnggQfSqFGjKmv8\/Oc\/L4bnPXv2zNChQ9O1a9dMmjQp\r\nl156acaNG5fhw4enXbt2ueCCCyqtMWfOnOy7777F8Pz444\/PoYcemmbNmmXUqFG56KKL8tlnn+Xg\r\ngw\/Os88+m6222mrVvxgAAAAAAAAAfO1KCoVCoa47MX78+PTs2TMLFizIgAED8sADD6R169aVtl24\r\ncGEaN2683PMTJ05Mjx49Ulpaml69euWJJ55Is2bNiuvnzZuXgQMHZuzYsWnYsGEmTJiQrl27Llfn\r\nvPPOy\/nnn58kufTSS3PWWWdVWP\/ss89mxx13TGlpaXbaaaeMHDnyyxz6cqZMmZKOHTsmSSZPnpwO\r\nHTqs0vr\/yzqf82Bdd4HVxHsX71PXXUjinKX26ss5CwAAAAAAX1Zd56X14h7op556ahYsWJC2bdvm\r\nnnvuqTI8T1JpeJ4kV155ZUpLS5Mkw4YNqxCeJ0nz5s0zbNiwJElpaWmuuuqq5WosWrQov\/vd75Ik\r\nPXr0yBlnnLFcmx122CHHHXdckmTUqFF54YUXaj5AAAAAAAAAAOq9Og\/QJ0yYkEcffTRJcsopp6Rt\r\n27YrXKNQKORvf\/tbkqR79+7p27dvpe369u2bTTfdNEly3333ZdnB94899lhmzZqVJDnqqKPSoEHl\r\nL8\/RRx9dXL7nnntWuL8AAAAAAAAA1D91HqDfddddxeWDDz64uPzpp5\/m7bffzsyZM2us8e6772bq\r\n1KlJkoEDB1bbtmz9lClT8t5771VY9+STTy7XrjK9evVKixYtkiRPPfVUjf0DAAAAAAAAoP6r8wB9\r\n9OjRSZLWrVunR48eufXWW7P11ltn7bXXTrdu3dK2bdt06dIl559\/fubMmVNpjfHjxxeXu3fvXu3+\r\nyq8vv92K1GnYsGHx\/unL1gAAAAAAAABg9dSwrjvwxhtvJEk6d+6cU089Nddcc81ybd59992cd955\r\n+etf\/5qHH3447du3r7B+8uTJxeWabiJfdsP5Zbcr\/7hFixZp06ZNjXVeeeWVTJ8+PQsWLEiTJk2q\r\nbV9mypQp1a6fNm1areoAAAAAAAAAsGrVeYD+ySefJFl6L\/SXX345bdq0ycUXX5wDDzwwa665Zl59\r\n9dX88pe\/zD\/\/+c+89tprOfjgg\/Pkk09WuD\/57Nmzi8stW7asdn9lU68nWW5Ee1mdmmpUVqe2AXr5\r\nAB8AAAAAAACA+qPOp3CfO3dukmTBggVZY4018s9\/\/jMnnnhi2rVrlyZNmqRXr175+9\/\/nr322itJ\r\n8swzz+See+6pUOOLL74oLjdu3Lja\/ZUPuufPn19pnZpq1FQHAAAAAAAAgNVPnY9Ab9q0aTFEP\/jg\r\ng9O3b9\/l2jRo0CCXXXZZ\/vnPfyZJbr\/99hx00EEVapRZuHBhtftbsGBBcblZs2bL9aU2NWqqU51l\r\np41f1rRp09KnT59a1wMAAAAAAABg1ajzAL1Vq1bFAL1slHllNt9882ywwQaZOnVqxowZs1yNMstO\r\ny76ssn0ly0\/VXlanpho11alOTfdoBwAAAAAAAKBu1PkU7uXvCV5TuFzW9uOPP67wfPntpkyZUm2N\r\n8iPAl70feVmduXPnZtasWbWqUzbVPAAAAAAAAACrtzoP0DfffPPi8uLFi6ttW7a+YcOKA+c322yz\r\n4vKECROqrVF+fY8ePVaqTmlpaSZNmlRpDQAAAAAAAABWT3UeoO+4447F5bJQuirvvPNOkmSDDTao\r\n8PxGG22U9u3bJ0kef\/zxams88cQTxRqdO3eusK5\/\/\/7F5erqjB07tjiFe79+\/ardHwAAAAAAAACr\r\nhzoP0Pfbb780atQoSXLPPfdU2e7xxx\/PzJkzkyQDBgyosK6kpCSDBw9OsnTk+OjRoyutMXr06OLI\r\n8sGDB6ekpKTC+kGDBqV169ZJkptuuimFQqHSOiNGjCguH3DAAVX2GQAAAAAAAIDVR50H6Ouss06+\r\n973vJUkeeeSR3HHHHcu1mT17dk477bTi4xNPPHG5NqeddlpxavdTTz018+fPr7B+\/vz5OfXUU5Ms\r\nnQK+fL0yjRs3zg9\/+MMkyfjx43P55Zcv1+bZZ5\/NjTfemCQZOHBgevfuXYujBAAAAAAAAKC+q\/MA\r\nPUnOP\/\/8bLjhhkmS7373uzn11FMzatSovPDCCxkxYkT69OmTl156KUly8sknVxpad+vWLWeeeWaS\r\npVOs9+vXL3feeWfGjh2bO++8M\/369cvYsWOTJGeddVY22WSTSvty1llnpVu3bkmSoUOH5sQTT8yo\r\nUaMyevToXHTRRdl9991TWlqaZs2a5aqrrlrFrwQAAAAAAAAAdaWkUNU85V+z8ePHZ7\/99svEiROr\r\nbHPsscfmuuuuK075vqwlS5bk+OOPzx\/\/+Mcqaxx33HEZPnx4GjSo+rsDEydOzN57752333670vVr\r\nrrlmbr311uy7775V1lhZU6ZMSceOHZMkkydPTocOHVb5Pv5XdT7nwbruAquJ9y7ep667kMQ5S+3V\r\nl3MWAAAAAAC+rLrOS+vFCPQk6dGjR1566aVcdtll2X777bP22muncePG6dChQw455JCMHDkyN954\r\nY5XheZI0aNAgN954Yx588MEMHjw47du3T+PGjdO+ffsMHjw4\/\/jHP3LDDTdUG54nycYbb5xx48bl\r\nkksuSa9evdKmTZs0b948m266aU4\/\/fS88sorX0l4DgAAAAAAAEDdqTcj0Fmqrr9R8d\/MaF5qq76M\r\n5nXOUlv15ZwFAAAAAIAvq67z0nozAh0AAAAAAAAA6pIAHQAAAAAAAAAiQAcAAAAAAACAJAJ0AAAA\r\nAAAAAEgiQAcAAAAAAACAJAJ0AAAAAAAAAEgiQAcAAAAAAACAJAJ0AAAAAAAAAEgiQAcAAAAAAACA\r\nJAJ0AAAAAAAAAEgiQAcAAAAAAACAJAJ0AAAAAAAAAEgiQAcAAAAAAACAJAJ0AAAAAAAAAEgiQAcA\r\nAAAAAACAJAJ0AAAAAAAAAEgiQAcAAAAAAACAJAJ0AAAAAAAAAEgiQAcAAAAAAACAJAJ0AAAAAAAA\r\nAEgiQAcAAAAAAACAJAJ0AAAAAAAAAEgiQAcAAAAAAACAJAJ0AAAAAAAAAEgiQAcAAAAAAACAJAJ0\r\nAAAAAAAAAEgiQAcAAAAAAACAJAJ0AAAAAAAAAEgiQAcAAAAAAACAJEnDuu4AAPDfo\/M5D9Z1F1gN\r\nvHfxPnXdBQAAAACAShmBDgAAAAAAAAARoAMAAAAAAABAEgE6AAAAAAAAACQRoAMAAAAAAABAEgE6\r\nAAAAAAAAACQRoAMAAAAAAABAEgE6AAAAAAAAACQRoAMAAAAAAABAEgE6AAAAAAAAACQRoAMAAAAA\r\nAABAEgE6AAAAAAAAACQRoAMAAAAAAABAEgE6AAAAAAAAACQRoAMAAAAAAABAEgE6AAAAAAAAACQR\r\noAMAAAAAAABAEgE6AAAAAAAAACQRoAMAAAAAAABAEgE6AAAAAAAAACQRoAMAAAAAAABAEgE6AAAA\r\nAAAAACQRoAMAAAAAAABAEgE6AAAAAAAAACQRoAMAAAAAAABAEgE6AAAAAAAAACQRoAMAAAAAAABA\r\nEgE6AAAAAAAAACQRoAMAAAAAAABAEgE6AAAAAAAAACQRoAMAAAAAAABAEgE6AAAAAAAAACQRoAMA\r\nAAAAAABAEgE6AAAAAAAAACQRoAMAAAAAAABAEgE6AAAAAAAAACQRoAMAAAAAAABAEgE6AAAAAAAA\r\nACQRoAMAAAAAAABAEgE6AAAAAAAAACQRoAMAAAAAAABAEgE6AAAAAAAAACQRoAMAAAAAAABAEgE6\r\nAAAAAAAAACQRoAMAAAAAAABAEgE6AAAAAAAAACQRoAMAAAAAAABAEgE6AAAAAAAAACQRoAMAAAAA\r\nAABAEgE6AAAAAAAAACQRoAMAAAAAAABAEgE6AAAAAAAAACQRoAMAAAAAAABAEgE6AAAAAAAAACQR\r\noAMAAAAAAABAEgE6AAAAAAAAACQRoAMAAAAAAABAEgE6AAAAAAAAACQRoAMAAAAAAABAEgE6AAAA\r\nAAAAACQRoAMAAAAAAABAEgE6AAAAAAAAACQRoAMAAAAAAABAEgE6AAAAAAAAACQRoAMAAAAAAABA\r\nEgE6AAAAAAAAACQRoAMAAAAAAABAEgE6AAAAAAAAACQRoAMAAAAAAABAEgE6AAAAAAAAACQRoAMA\r\nAAAAAABAEgE6AAAAAAAAACQRoAMAAAAAAABAEgE6AAAAAAAAACQRoAMAAAAAAABAEgE6AAAAAAAA\r\nACQRoAMAAAAAAABAEgE6AAAAAAAAACQRoAMAAAAAAABAEgE6AAAAAAAAACQRoAMAAAAAAABAEgE6\r\nAAAAAAAAACQRoAMAAAAAAABAEgE6AAAAAAAAACQRoAMAAAAAAABAEgE6AAAAAAAAACQRoAMAAAAA\r\nAABAEgE6AAAAAAAAACQRoAMAAAAAAABAEgE6AAAAAAAAACQRoAMAAAAAAABAEgE6AAAAAAAAACQR\r\noAMAAAAAAABAEgE6AAAAAAAAACSpJwF6SUlJrX4GDRpUY62HHnooBx54YDp06JAmTZqkQ4cOOfDA\r\nA\/PQQw\/Vuj\/z5s3LZZddlj59+mTttddOy5Yt06NHj5x55pn54IMPvsSRAgAAAAAAAFBfNazrDqwq\r\nhUIhJ510UoYPH17h+alTp+bee+\/NvffemxNOOCHXXXddSkpKqqwzadKk7LPPPnnzzTcrPD9hwoRM\r\nmDAhN9xwQ2677bbsvffeX8lxAAAAAAAAAFA36lWAfvLJJ+f73\/9+letbtGhR5bqf\/\/znxfC8Z8+e\r\nGTp0aLp27ZpJkybl0ksvzbhx4zJ8+PC0a9cuF1xwQaU15syZk3333bcYnh9\/\/PE59NBD06xZs4wa\r\nNSoXXXRRPvvssxx88MF59tlns9VWW32JowUAAAAAAACgPqlXAfq6666bLbbYYoW3mzhxYi699NIk\r\nSa9evfLEE0+kWbNmSZLevXtnv\/32y8CBAzN27NhccsklOeaYY9K1a9fl6lx++eWZMGFCkuTSSy\/N\r\nWWedVVy3ww47ZKeddsqOO+6YefPm5bTTTsvIkSNX5jABAAAAAAAAqIfqxT3Qv6wrr7wypaWlSZJh\r\nw4YVw\/MyzZs3z7Bhw5IkpaWlueqqq5arsWjRovzud79LkvTo0SNnnHHGcm122GGHHHfccUmSUaNG\r\n5YUXXliVhwEAAAAAAABAHVrtA\/RCoZC\/\/e1vSZLu3bunb9++lbbr27dvNt100yTJfffdl0KhUGH9\r\nY489llmzZiVJjjrqqDRoUPlLc\/TRRxeX77nnni\/ZewAAAAAAAADqi9U+QH\/33XczderUJMnAgQOr\r\nbVu2fsqUKXnvvfcqrHvyySeXa1eZXr16Fe\/F\/tRTT61MlwEAAAAAAACoh+pVgH7XXXdl0003TbNm\r\nzdKqVatssskmOeqoozJq1Kgqtxk\/fnxxuXv37tXWL7++\/HYrUqdhw4bF+6cvWwMAAAAAAACA1VfD\r\nuu5AeW+88UaFxxMnTszEiRNz8803Z\/\/998+IESPSunXrCm0mT55cXO7QoUO19Tt27FjpduUft2jR\r\nIm3atKmxziuvvJLp06dnwYIFadKkSbXty5syZUq166dNm1brWgAAAAAAAACsOvUiQG\/evHn222+\/\r\n7LLLLunevXtatmyZ6dOn5\/HHH891112XmTNn5r777svgwYPzyCOPpFGjRsVtZ8+eXVxu2bJltfsp\r\nm3o9SebMmVNhXVmdmmpUVmdFAvTyIT4AAAAAAAAA9Ue9CNCnTp1a6ajv3XbbLaeeemr22muvjBs3\r\nLo8\/\/niuvfba\/PCHPyy2+eKLL4rLjRs3rnY\/5YPu+fPnV1hXVqemGjXVAQAAAAAAAGD1VC8C9Oqm\r\nTP\/GN76Rv\/71r+nRo0cWLlyYYcOGVQjQmzZtWlxeuHBhtftZsGBBcblZs2YV1pXVqalGTXVqsuzU\r\n8cuaNm1a+vTps0I1AQAAAAAAAPjy6kWAXpMuXbpkt912y4MPPpiJEyfmww8\/TPv27ZMkrVq1KrZb\r\ndlr2Zc2dO7e4vOxU7WV1aqpRU52a1HSfdgAAAAAAAADqRoO67kBtbbbZZsXlqVOnFpfLB9JTpkyp\r\ntkb50d\/L3ou8rM7cuXMza9asWtVp167dCt3\/HAAAAAAAAID6a7UJ0AuFQqXPlw\/WJ0yYUG2N8ut7\r\n9OixUnVKS0szadKkSmsAAAAAAAAAsPpabQL0N954o7hcNn17kmy00UbFx48\/\/ni1NZ544okkyQYb\r\nbJDOnTtXWNe\/f\/\/icnV1xo4dW5zCvV+\/frXrPAAAAAAAAAD13moRoL\/zzjt55JFHkiy9H\/oGG2xQ\r\nXFdSUpLBgwcnWTpyfPTo0ZXWGD16dHFk+eDBg1NSUlJh\/aBBg9K6deskyU033VTliPcRI0YUlw84\r\n4ICVOyAAAAAAAAAA6p06D9AfeOCBlJaWVrn+P\/\/5Tw466KAsWrQoSfKDH\/xguTannXZaGjZsmCQ5\r\n9dRTM3\/+\/Arr58+fn1NPPTVJ0rBhw5x22mnL1WjcuHF++MMfJknGjx+fyy+\/fLk2zz77bG688cYk\r\nycCBA9O7d+9aHCEAAAAAAAAAq4OGdd2BU089NYsWLcqQIUOyww47pHPnzmnWrFlmzJiRxx57LNdd\r\nd11mzpyZZOk065UF6N26dcuZZ56Ziy++OGPHjk2\/fv1y9tlnp2vXrpk0aVIuueSSjBs3Lkly1lln\r\nZZNNNqm0L2eddVbuvPPOvPXWWxk6dGgmTpyYQw89NM2aNcuoUaPym9\/8JqWlpWnWrFmuuuqqr+w1\r\nAQAAAAAAAODrV+cBepJ8+OGHGTZsWIYNG1ZlmyFDhuSGG25IkyZNKl1\/4YUX5uOPP84f\/\/jHjBs3\r\nLoceeuhybY477rhccMEFVe6jVatWefDBB7P33nvn7bffzvDhwzN8+PAKbdZcc83ceuut2WabbWp3\r\ncAAA1Fudz3mwrrvAauK9i\/ep6y4AAAAA8DWo8wD9pptuyuOPP55nn30277zzTmbMmJHPP\/88LVu2\r\nTMeOHfPNb34zRx11VHbYYYdq6zRo0CA33nhjhgwZkuHDh2fMmDGZMWNG2rZtm969e+fEE0\/MXnvt\r\nVWN\/Nt5444wbNy7XXHNN7rrrrkycODELFy5Mx44ds\/fee+dHP\/pROnXqtKoOHwAAAAAAAIB6os4D\r\n9IEDB2bgwIGrrN7ee++dvffe+0vVaNGiRYYOHZqhQ4euol4BAAAAAAAAUN81qOsOAAAAAAAAAEB9\r\nIEAHAAAAAAAAgAjQAQAAAAAAACCJAB0AAAAAAAAAkgjQAQAAAAAAACCJAB0AAAAAAAAAkgjQAQAA\r\nAAAAACCJAB0AAAAAAAAAkgjQAQAAAAAAACCJAB0AAAAAAAAAkgjQAQAAAAAAACCJAB0AAAAAAAAA\r\nkgjQAQAAAAAAACCJAB0AAAAAAAAAkgjQAQAAAAAAACCJAB0AAAAAAAAAkgjQAQAAAAAAACCJAB0A\r\nAAAAAAAAkgjQAQAAAAAAACCJAB0AAAAAAAAAkgjQAQAAAAAAACCJAB0AAAAAAAAAkgjQAQAAAAAA\r\nACCJAB0AAAAAAAAAkgjQAQAAAAAAACCJAB0AAAAAAAAAkgjQAQAAAAAAACCJAB0AAAAAAAAAkgjQ\r\nAQAAAAAAACCJAB0AAAAAAAAAkgjQAQAAAAAAACCJAB0AAAAAAAAAkgjQAQAAAAAAACCJAB0AAAAA\r\nAAAAkgjQAQAAAAAAACCJAB0AAAAAAAAAkgjQAQAAAAAAACCJAB0AAAAAAAAAkgjQAQAAAAAAACCJ\r\nAB0AAAAAAAAAkgjQAQAAAAAAACCJAB0AAAAAAAAAkgjQAQAAAAAAACCJAB0AAAAAAAAAkgjQAQAA\r\nAAAAACCJAB0AAAAAAAAAkgjQAQAAAAAAACCJAB0AAAAAAAAAkgjQAQAAAAAAACCJAB0AAAAAAAAA\r\nkgjQAQAAAAAAACCJAB0AAAAAAAAAkgjQAQAAAAAAACCJAB0AAAAAAAAAkgjQAQAAAAAAACCJAB0A\r\nAAAAAAAAkgjQAQAAAAAAACCJAB0AAAAAAAAAkgjQAQAAAAAAACCJAB0AAAAAAAAAkgjQAQAAAAAA\r\nACBJ0rCuOwAAAEDtdD7nwbruAquJ9y7ep667kMQ5S+3Vl3MWAADACHQAAAAAAAAAiAAdAAAAAAAA\r\nAJII0AEAAAAAAAAgiQAdAAAAAAAAAJII0AEAAAAAAAAgiQAdAAAAAAAAAJII0AEAAAAAAAAgiQAd\r\nAAAAAAAAAJII0AEAAAAAAAAgiQAdAAAAAAAAAJII0AEAAAAAAAAgiQAdAAAAAAAAAJII0AEAAAAA\r\nAAAgiQAdAAAAAAAAAJII0AEAAAAAAAAgiQAdAAAAAAAAAJII0AEAAAAAAAAgiQAdAAAAAAAAAJII\r\n0AEAAAAAAAAgiQAdAAAAAAAAAJII0AEAAAAAAAAgSdKwrjsAAAAAAPVF53MerOsusBp47+J96roL\r\nRc5Zaqu+nLfOWWqrvpyzifOW2qlP5yxfjhHoAAAAAAAAABABOgAAAAAAAAAkEaADAAAAAAAAQBIB\r\nOgAAAAAAAAAkEaADAAAAAAAAQBIBOgAAAAAAAAAkEaADAAAAAAAAQBIBOgAAAAAAAAAkEaADAAAA\r\nAAAAQBIBOgAAAAAAAAAkEaADAAAAAAAAQBIBOgAAAAAAAAAkEaADAAAAAAAAQBIBOgAAAAAAAAAk\r\nEaADAAAAAAAAQBIBOgAAAAAAAAAkEaADAAAAAAAAQBIBOgAAAAAAAAAkEaADAAAAAAAAQBIBOgAA\r\nAAAAAAAkEaADAAAAAAAAQBIBOgAAAAAAAAAkEaADAAAAAAAAQBIBOgAAAAAAAAAkEaADAAAAAAAA\r\nQBIBOgAAAAAAAAAkEaADAAAAAAAAQBIBOgAAAAAAAAAkEaADAAAAAAAAQBIBOgAAAAAAAAAkEaAD\r\nAAAAAAAAQBIBOgAAAAAAAAAkEaADAAAAAAAAQBIBOgAAAAAAAAAkEaADAAAAAAAAQBIBOgAAAAAA\r\nAAAkEaADAAAAAAAAQBIBOgAAAAAAAAAkEaADAAAAAAAAQJJ6HqAPHTo0JSUlxZ\/HHnusxm0eeuih\r\nHHjggenQoUOaNGmSDh065MADD8xDDz1U6\/3Omzcvl112Wfr06ZO11147LVu2TI8ePXLmmWfmgw8+\r\n+BJHBAAAAAAAAEB91bCuO1CVl19+OVdeeWWt2xcKhZx00kkZPnx4heenTp2ae++9N\/fee29OOOGE\r\nXHfddSkpKamyzqRJk7LPPvvkzTffrPD8hAkTMmHChNxwww257bbbsvfee6\/YAQEAAAAAAABQr9XL\r\nEehLlizJ8ccfn9LS0qy77rq12ubnP\/95MTzv2bNnbr\/99jz\/\/PO5\/fbb07NnzyTJ8OHD84tf\/KLK\r\nGnPmzMm+++5bDM+PP\/74PProo3nmmWdy4YUXpmXLlvnss89y8MEH55VXXvmSRwkAAAAAAABAfVIv\r\nA\/Srr746Y8aMSffu3XPcccfV2H7ixIm59NJLkyS9evXK008\/nUMPPTS9e\/fOoYcemqeeeiq9evVK\r\nklxyySWZNGlSpXUuv\/zyTJgwIUly6aWXZvjw4dl5552zww475Kc\/\/Wn+9a9\/pWHDhpk3b15OO+20\r\nVXOwAAAAAAAAANQL9S5Anzx5cnGU+LXXXpvGjRvXuM2VV16Z0tLSJMmwYcPSrFmzCuubN2+eYcOG\r\nJUlKS0tz1VVXLVdj0aJF+d3vfpck6dGjR84444zl2uywww7FQH\/UqFF54YUXan9gAAAAAAAAANRr\r\n9S5A\/\/73v585c+bkqKOOyqBBg2psXygU8re\/\/S1J0r179\/Tt27fSdn379s2mm26aJLnvvvtSKBQq\r\nrH\/ssccya9asJMlRRx2VBg0qf2mOPvro4vI999xTY\/8AAAAAAAAAWD3UqwD9L3\/5S\/7+979n7bXX\r\nzmWXXVarbd59991MnTo1STJw4MBq25atnzJlSt57770K65588snl2lWmV69eadGiRZLkqaeeqlUf\r\nAQAAAAAAAKj\/6k2APmvWrPzoRz9KsvQ+5e3atavVduPHjy8ud+\/evdq25deX325F6jRs2DBdu3at\r\ntAYAAAAAAAAAq6+Gdd2BMkOHDs1HH32Ub37zm8X7jNfG5MmTi8sdOnSotm3Hjh0r3a784xYtWqRN\r\nmzY11nnllVcyffr0LFiwIE2aNKl1f6dMmVLt+mnTptW6FgAAAAAAAACrTr0I0J966qnccMMNadiw\r\nYa677rqUlJTUetvZs2cXl1u2bFlt27Kp15Nkzpw5ldapqUZldVYkQC8f4gMAAAAAAABQf9T5FO4L\r\nFy7MCSeckEKhkNNPPz1bbrnlCm3\/xRdfFJcbN25cbdvyQff8+fMrrVNTjZrqAAAAAAAAALB6qvMR\r\n6L\/5zW8yfvz4bLjhhjn33HNXePumTZsWlxcuXFht2wULFhSXmzVrVmmdmmrUVKcmy04dv6xp06al\r\nT58+K1QTAAAAAAAAgC+vTgP0CRMm5KKLLkqSDBs2rMLU6LXVqlWr4vKy07Iva+7cucXlZadqL6tT\r\nU42a6tSkpvu0AwAAAAAAAFA36jRAv\/LKK7Nw4cJ06dIl8+bNyx133LFcm9dee624PHLkyHz00UdJ\r\nkm9961tp0aJFhUB6ypQp1e6v\/OjvZe9F3qFDhzz33HOZO3duZs2alTZt2tRYp127dit0\/3MAAAAA\r\nAAAA6q86DdDLpkJ\/5513cthhh9XY\/te\/\/nVx+d13302LFi2y2WabFZ+bMGFCtduXX9+jR48K6zbb\r\nbLPcfffdxXZ9+\/attEZpaWkmTZpUaQ0AAAAAAAAAVl8N6roDX9ZGG22U9u3bJ0kef\/zxats+8cQT\r\nSZINNtggnTt3rrCuf\/\/+xeXq6owdO7Y4hXu\/fv1WpssAAAAAAAAA1EN1GqCPGDEihUKh2p9zzz23\r\n2H7UqFHF58sC8JKSkgwePDjJ0pHjo0ePrnRfo0ePLo5AHzx4cEpKSiqsHzRoUFq3bp0kuemmm1Io\r\nFKrsc5kDDjhgpY4bAAAAAAAAgPpntR+BniSnnXZaGjZcOhv9qaeemvnz51dYP3\/+\/Jx66qlJkoYN\r\nG+a0005brkbjxo3zwx\/+MEkyfvz4XH755cu1efbZZ3PjjTcmSQYOHJjevXuvysMAAAAAAAAAoA79\r\nVwTo3bp1y5lnnplk6RTr\/fr1y5133pmxY8fmzjvvTL9+\/TJ27NgkyVlnnZVNNtmk0jpnnXVWunXr\r\nliQZOnRoTjzxxIwaNSqjR4\/ORRddlN133z2lpaVp1qxZrrrqqq\/l2AAAAAAAAAD4ejSs6w6sKhde\r\neGE+\/vjj\/PGPf8y4ceNy6KGHLtfmuOOOywUXXFBljVatWuXBBx\/M3nvvnbfffjvDhw\/P8OHDK7RZ\r\nc801c+utt2abbbZZ1YcAAAAAAAAAQB36rxiBniQNGjTIjTfemAcffDCDBw9O+\/bt07hx47Rv3z6D\r\nBw\/OP\/7xj9xwww1p0KD6Q954440zbty4XHLJJenVq1fatGmT5s2bZ9NNN83pp5+eV155Jfvuu+\/X\r\ndFQAAAAAAAAAfF3q\/Qj08847L+edd16t2++9997Ze++9v9Q+W7RokaFDh2bo0KFfqg4AAAAAAAAA\r\nq4\/\/mhHoAAAAAAAAAPBlCNABAAAAAAAAIAJ0AAAAAAAAAEgiQAcAAAAAAACAJAJ0AAAAAAAAAEgi\r\nQAcAAAAAAACAJAJ0AAAAAAAAAEgiQAcAAAAAAACAJAJ0AAAAAAAAAEgiQAcAAAAAAACAJAJ0AAAA\r\nAAAAAEgiQAcAAAAAAACAJAJ0AAAAAAAAAEgiQAcAAAAAAACAJAJ0AAAAAAAAAEgiQAcAAAAAAACA\r\nJAJ0AAAAAAAAAEgiQAcAAAAAAACAJAJ0AAAAAAAAAEgiQAcAAAAAAACAJAJ0AAAAAAAAAEgiQAcA\r\nAAAAAACAJAJ0AAAAAAAAAEgiQAcAAAAAAACAJAJ0AAAAAAAAAEgiQAcAAAAAAACAJAJ0AAAAAAAA\r\nAEgiQAcAAAAAAACAJAJ0AP4\/9u483Kuq0B\/\/+wPIjJKlJIKikIrllIIDJmpWX9FENIeuE+ZtslQK\r\nxTI1R67ghFlpiKaVOd1SS81KnFAxkkxMQYVURBEnQJmFs35\/+Dufew6zCpyDvV7Pw\/Ns9lp7nbV5\r\nFvvsvd97rw0AAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEAS\r\nAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAA\r\nAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAA\r\nJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToA\r\nAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAA\r\nAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGg\r\nAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAA\r\nAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEAS\r\nAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAA\r\nAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAA\r\nJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToA\r\nAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAA\r\nAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGg\r\nAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAA\r\nAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEAS\r\nAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAA\r\nAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAA\r\nJBGgAwAAAAAAAEASAToAAAAAAAAAJBGgAwAAAAAAAEASAToAAAAAAAAAJGkEAfrbb7+dG2+8MQMH\r\nDkzv3r3TrVu3rLfeemnevHk23HDD7Lnnnhk6dGjefPPNlWrv7rvvzkEHHZROnTqlRYsW6dSpUw46\r\n6KDcfffdK92nOXPm5MILL0zPnj2z\/vrrp23btunevXtOPvnkTJ48+YPuKgAAAAAAAACNWLOG7sCY\r\nMWPy1a9+dallr7\/+eh544IE88MADufDCC\/Ob3\/wmX\/rSl5Zat5SSb33rWxk+fHi99S+\/\/HJuvfXW\r\n3HrrrfnGN76RK6+8MpVKZZn9mTRpUvbbb78888wz9dZPmDAhEyZMyIgRI\/Lb3\/42ffr0eZ97CgAA\r\nAAAAAEBj1uBvoCdJ586dc\/TRR+eyyy7L73\/\/+4wePToPP\/xwbrrpphxyyCFp2rRp3njjjRxwwAEZ\r\nN27cUts4\/fTTq+H5DjvskBtuuCFjxozJDTfckB122CFJMnz48JxxxhnL7MesWbOy\/\/77V8Pzr3\/9\r\n6xk5cmQeeeSRnH\/++Wnbtm1mzpyZQw45ZJn9AAAAAAAAAGDt1OBvoO+1117LnRb90EMPzW233ZZ+\r\n\/fplwYIFOfvss\/O73\/2uXp2JEydm6NChSZKddtopDz74YFq1apUk6dGjRw444ID07t07jz32WIYM\r\nGZJjjz02Xbt2XeJnXXTRRZkwYUKSZOjQoTnllFOqZbvuumv22muv7LHHHpkzZ04GDBiQe++990Pv\r\nPwAAAAAAAACNQ4O\/gd60adMV1jnwwAOz1VZbJUkefPDBJcovvfTSLFy4MEly+eWXV8PzWq1bt87l\r\nl1+eJFm4cGGGDRu2RBvvvvtuLrvssiRJ9+7dM3DgwCXq7LrrrjnuuOOSJPfdd1\/Gjh27wr4DAAAA\r\nAAAAsHZo8AB9ZbVp0yZJMm\/evHrrSym5\/fbbkyRbbbVVdtlll6Vuv8suu2TLLbdMktx2220ppdQr\r\nv\/\/++zNjxowkyTHHHJMmTZb+T9O\/f\/\/q8u9\/\/\/v3vR8AAAAAAAAANE5rRYA+fvz4\/POf\/0yS6pvo\r\ntZ5\/\/vm8\/PLLSZLevXsvt53a8ilTpuSFF16oVzZq1Kgl6i3NTjvtVA3zH3rooZXqPwAAAAAAAACN\r\nX6MN0OfMmZPnnnsul1xySfbaa68sWrQoSXLSSSfVqzd+\/Pjq8uLh+uLqltfd7v2006xZs+r30xdv\r\nAwAAAAAAAIC1V7OG7kBd1157bY499thllp988sk54ogj6q176aWXqsudOnVabvudO3de6nZ1\/96m\r\nTZu0b99+he2MGzcur7\/+eubPn58WLVost35dU6ZMWW751KlTV7otAAAAAAAAAFadRhWgL8v222+f\r\nK6+8MjvvvPMSZe+88051uW3btsttp3bq9SSZNWvWUttZURtLa+f9BOh1Q3wAAAAAAAAAGo9GNYX7\r\ngQcemCeffDJPPvlkxowZkxtuuCH9+vXLP\/\/5zxxxxBG54447lthm3rx51eXmzZsvt\/26QffcuXOX\r\n2s6K2lhROwAAAAAAAACsnRrVG+jt27evN316jx49cvjhh+fXv\/51jjnmmPTt2zdXX311+vfvX63T\r\nsmXL6vKCBQuW2\/78+fOry61atapXVtvOitpYUTsrsvjU8YubOnVqevbs+b7aBAAAAAAAAODDa1QB\r\n+rIcddRRueOOO3LzzTfnu9\/9bvr27ZuPfexjSZJ27dpV6y0+LfviZs+eXV1efKr22nZW1MaK2lmR\r\nFX2nHQAAAAAAAICG0aimcF+evn37JnkvvP7Tn\/5UXV83kJ4yZcpy26j79vfi3yKvbWf27NmZMWPG\r\nSrWzwQYbvK\/vnwMAAAAAAADQeK01AfoGG2xQXX7xxRery1tvvXV1ecKECctto2559+7d65WtbDsL\r\nFy7MpEmTltoGAAAAAAAAAGuvtSZAf\/nll6vLdadN32yzzdKxY8ckyQMPPLDcNh588MEkycYbb5wu\r\nXbrUK9t9992ry8tr57HHHqtO4d6rV6+V6zwAAAAAAAAAjd5aE6Dfcsst1eVtttmmulypVKrTu0+Y\r\nMCGPPvroUrd\/9NFHq2+W9+3bN5VKpV75nnvumfXWWy9Jct1116WUstR2rr322upyv3793v+OAAAA\r\nAAAAANAoNXiAfu2112bevHnLrXPppZfmrrvuSpJ06dKl3tviSTJgwIA0a9YsSXLCCSdk7ty59crn\r\nzp2bE044IUnSrFmzDBgwYImf0bx585x44olJkvHjx+eiiy5aos7o0aNz9dVXJ0l69+6dHj16rMQe\r\nAgAAAAAAALA2aNbQHTjrrLMycODAHHzwwdl9993TtWvXtG3bNu+8806efPLJXH\/99Xn44YeTvBdy\r\nX3XVVdWwvNYWW2yRk08+ORdccEEee+yx9OrVK6eeemq6du2aSZMmZciQIXn88ceTJKeccko+9alP\r\nLbUvp5xySm666aY8++yzGTRoUCZOnJjDDz88rVq1yn333ZfBgwdn4cKFadWqVYYNG7Za\/10AAAAA\r\nAAAAWLMaPEBPkrfeeitXXXVVrrrqqmXW6dSpU6655prss88+Sy0\/\/\/zz89prr+Waa67J448\/nsMP\r\nP3yJOscdd1zOO++8Zf6Mdu3a5c4770yfPn3y3HPPZfjw4Rk+fHi9Ouuuu26uv\/76bL\/99iu3cwAA\r\nAAAAAACsFRo8QB85cmTuueee3HfffRk\/fnymTZuWN998My1btkyHDh2y\/fbbZ\/\/998+hhx6a1q1b\r\nL7OdJk2a5Oqrr87BBx+c4cOH5+9\/\/3veeOONfOITn0iPHj3yzW9+M\/vuu+8K+9OtW7c8\/vjj+dnP\r\nfpZbbrklEydOzIIFC9K5c+f06dMnJ510UjbddNNV+U8AAAAAAAAAQCPQ4AF6165d07Vr13zzm99c\r\nJe316dMnffr0+VBttGnTJoMGDcqgQYNWSZ8AAAAAAAAAaPyaNHQHAAAAAAAAAKAxEKADAAAAAAAA\r\nQAToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4A\r\nAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAA\r\nAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQTo\r\nAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAA\r\nAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBE\r\ngA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAA\r\nAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAA\r\nSQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4A\r\nAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAA\r\nAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQTo\r\nAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAA\r\nAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBE\r\ngA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAA\r\nAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAA\r\nSQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4A\r\nAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAA\r\nAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQTo\r\nAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAA\r\nAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBE\r\ngA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAA\r\nAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAA\r\nSQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4AAAAAAAAASQToAAAAAAAAAJBEgA4A\r\nAAAAAAAASQToAAAAAAAAAJCkkQTo\/\/jHPzJ48ODsu+++6dy5c1q0aJG2bdtmiy22SP\/+\/TNq1Kj3\r\n1d7dd9+dgw46KJ06dUqLFi3SqVOnHHTQQbn77rtXuo05c+bkwgsvTM+ePbP++uunbdu26d69e04+\r\n+eRMnjz5\/e4iAAAAAAAAAI1cs4buQO\/evfPggw8usX7BggV57rnn8txzz+W6667LUUcdlREjRqR5\r\n8+bLbKuUkm9961sZPnx4vfUvv\/xybr311tx66635xje+kSuvvDKVSmWZ7UyaNCn77bdfnnnmmXrr\r\nJ0yYkAkTJmTEiBH57W9\/mz59+rzPvQUAAAAAAACgsWrwN9BffvnlJEnHjh1z0kkn5X\/\/938zZsyY\r\njB49Opdcckk23njjJMmvf\/3r9O\/ff7ltnX766dXwfIcddsgNN9yQMWPG5IYbbsgOO+yQJBk+fHjO\r\nOOOMZbYxa9as7L\/\/\/tXw\/Otf\/3pGjhyZRx55JOeff37atm2bmTNn5pBDDsm4ceM+7O4DAAAAAAAA\r\n0Eg0+BvoW221VQYPHpyDDz44TZs2rVe2yy675KijjkqvXr3y7LPP5oYbbsi3v\/3tfO5zn1uinYkT\r\nJ2bo0KFJkp122ikPPvhgWrVqlSTp0aNHDjjggPTu3TuPPfZYhgwZkmOPPTZdu3Zdop2LLrooEyZM\r\nSJIMHTo0p5xySrVs1113zV577ZU99tgjc+bMyYABA3Lvvfeusn8LAAAAAAAAABpOg7+Bfscdd+TQ\r\nQw9dIjyv9YlPfCIXX3xx9e\/\/+7\/\/u9R6l156aRYuXJgkufzyy6vhea3WrVvn8ssvT5IsXLgww4YN\r\nW6KNd999N5dddlmSpHv37hk4cOASdXbdddccd9xxSZL77rsvY8eOXcEeAgAAAAAAALA2aPAAfWXs\r\nueee1eVJkyYtUV5Kye23357kvTfad9lll6W2s8suu2TLLbdMktx2220ppdQrv\/\/++zNjxowkyTHH\r\nHJMmTZb+z1N3Kvnf\/\/73K7sbAAAAAAAAADRia0WAvmDBgury0kLt559\/vvot9d69ey+3rdryKVOm\r\n5IUXXqhXNmrUqCXqLc1OO+2UNm3aJEkeeuih5XceAAAAAAAAgLXCWhGgP\/DAA9Xlrbbaaony8ePH\r\nL7e8rrrldbd7P+00a9as+v30xdsAAAAAAAAAYO3UrKE7sCI1NTW54IILqn8\/9NBDl6jz0ksvVZc7\r\ndeq03PY6d+681O3q\/r1NmzZp3779CtsZN25cXn\/99cyfPz8tWrRYbv1aU6ZMWW751KlTV6odAAAA\r\nAAAAAFatRh+gX3rppRkzZkySpF+\/ftlpp52WqPPOO+9Ul9u2bbvc9mqnXk+SWbNmLbWdFbWxtHZW\r\nNkCvG+ADAAAAAAAA0Hg06incH3jggfzgBz9Ikmy44Ya54oorllpv3rx51eXmzZsvt826QffcuXOX\r\n2s6K2lhROwAAAAAAAACsfRrtG+hPPfVU+vXrl4ULF6ZFixa5+eab06FDh6XWbdmyZXV5wYIFy213\r\n\/vz51eVWrVottZ0VtbGidpZn8WnjFzd16tT07NlzpdsDAAAAAAAAYNVolAH6888\/ny9+8YuZPn16\r\nmjZtmhtuuCG9e\/deZv127dpVlxefln1xs2fPri4vPlV7bTsramNF7SzPir7RDgAAAAAAAEDDaHRT\r\nuL\/yyivZZ5998sorr6RSqeSaa65Jv379lrtN3VB6ypQpy61b9w3wxb9HXtvO7NmzM2PGjJVqZ4MN\r\nNljp758DAAAAAAAA0Hg1qgD9jTfeyBe+8IX8+9\/\/TpJcfvnlOfroo1e43dZbb11dnjBhwnLr1i3v\r\n3r37B2pn4cKFmTRp0lLbAAAAAAAAAGDt1GgC9JkzZ+ZLX\/pSnn766STJBRdckO985zsrte1mm22W\r\njh07JkkeeOCB5dZ98MEHkyQbb7xxunTpUq9s9913ry4vr53HHnusOoV7r169VqqPAAAAAAAAADRu\r\njSJAnzNnTvbbb7\/84x\/\/SJL86Ec\/yqmnnrrS21cqlfTt2zfJe2+OP\/roo0ut9+ijj1bfLO\/bt28q\r\nlUq98j333DPrrbdekuS6665LKWWp7Vx77bXV5RVNLw8AAAAAAADA2qHBA\/QFCxakX79+efjhh5Mk\r\nJ510Us4777z33c6AAQPSrFmzJMkJJ5yQuXPn1iufO3duTjjhhCRJs2bNMmDAgCXaaN68eU488cQk\r\nyfjx43PRRRctUWf06NG5+uqrkyS9e\/dOjx493ndfAQAAAAAAAGh8mjV0B7761a\/mL3\/5S5Jk7733\r\nznHHHZd\/\/etfy6zfvHnzbLHFFkus32KLLXLyySfnggsuyGOPPZZevXrl1FNPTdeuXTNp0qQMGTIk\r\njz\/+eJLklFNOyac+9amltn\/KKafkpptuyrPPPptBgwZl4sSJOfzww9OqVavcd999GTx4cBYuXJhW\r\nrVpl2LBhH\/4fAAAAAAAAAIBGocED9N\/\/\/vfV5XvvvTfbbrvtcutvuummeeGFF5Zadv755+e1117L\r\nNddck8cffzyHH374EnWOO+645b7h3q5du9x5553p06dPnnvuuQwfPjzDhw+vV2fdddfN9ddfn+23\r\n3365fQUAAAAAAABg7dHgU7ivSk2aNMnVV1+dO++8M3379k3Hjh3TvHnzdOzYMX379s1dd92VESNG\r\npEmT5e92t27d8vjjj2fIkCHZaaed0r59+7Ru3Tpbbrllvve972XcuHHZf\/\/919BeAQAAAAAAALAm\r\nNPgb6KWUVd5mnz590qdPnw\/VRps2bTJo0KAMGjRoFfUKAAAAAAAAgMbsI\/UGOgAAAAAAAAB8UAJ0\r\nAAAAAAAAAIgAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAA\r\nAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkA\r\nHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAA\r\nAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACS\r\nCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAA\r\nAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAA\r\nIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNAB\r\nAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAA\r\nAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkA\r\nHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAA\r\nAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACS\r\nCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAA\r\nAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAA\r\nIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNAB\r\nAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAA\r\nAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkA\r\nHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAA\r\nAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACS\r\nCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAA\r\nAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAA\r\nIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNAB\r\nAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAA\r\nAACSCNABAAAAAAAAIIkAHQAAAAAAAACSNJIA\/bXXXssdd9yRM888M\/vuu28+8YlPpFKppFKppH\/\/\r\n\/u+7vbvvvjsHHXRQOnXqlBYtWqRTp0456KCDcvfdd690G3PmzMmFF16Ynj17Zv3110\/btm3TvXv3\r\nnHzyyZk8efL77hMAAAAAAAAAjVuzhu5AknTo0GGVtFNKybe+9a0MHz683vqXX345t956a2699dZ8\r\n4xvfyJVXXplKpbLMdiZNmpT99tsvzzzzTL31EyZMyIQJEzJixIj89re\/TZ8+fVZJvwEAAAAAAABo\r\neI3iDfS6OnfunC9+8YsfaNvTTz+9Gp7vsMMOueGGGzJmzJjccMMN2WGHHZIkw4cPzxlnnLHMNmbN\r\nmpX999+\/Gp5\/\/etfz8iRI\/PII4\/k\/PPPT9u2bTNz5swccsghGTdu3AfqJwAAAAAAAACNT6N4A\/3M\r\nM89Mjx490qNHj3To0CEvvPBCNttss\/fVxsSJEzN06NAkyU477ZQHH3wwrVq1SpL06NEjBxxwQHr3\r\n7p3HHnssQ4YMybHHHpuuXbsu0c5FF12UCRMmJEmGDh2aU045pVq26667Zq+99soee+yROXPmZMCA\r\nAbn33ns\/6G4DAAAAAAAA0Ig0ijfQzz777Oy\/\/\/4fair3Sy+9NAsXLkySXH755dXwvFbr1q1z+eWX\r\nJ0kWLlyYYcOGLdHGu+++m8suuyxJ0r179wwcOHCJOrvuumuOO+64JMl9992XsWPHfuA+AwAAAAAA\r\nANB4NIoA\/cMqpeT2229Pkmy11VbZZZddllpvl112yZZbbpkkue2221JKqVd+\/\/33Z8aMGUmSY445\r\nJk2aLP2fp3\/\/\/tXl3\/\/+9x+y9wAAAAAAAAA0Bh+JAP3555\/Pyy+\/nCTp3bv3cuvWlk+ZMiUvvPBC\r\nvbJRo0YtUW9pdtppp7Rp0yZJ8tBDD32QLgMAAAAAAADQyHwkAvTx48dXl7faaqvl1q1bXne799NO\r\ns2bNqt9PX7wNAAAAAAAAANZOzRq6A6vCSy+9VF3u1KnTcut27tx5qdvV\/XubNm3Svn37FbYzbty4\r\nvP7665k\/f35atGixUn2dMmXKcsunTp26Uu0AAAAAAAAAsGp9JAL0d955p7rctm3b5datnXo9SWbN\r\nmrXUdlbUxtLaWdkAvW6ADwAAAAAAAEDj8ZGYwn3evHnV5ebNmy+3bt2ge+7cuUttZ0VtrKgdAAAA\r\nAAAAANY+H4k30Fu2bFldXrBgwXLrzp8\/v7rcqlWrpbazojZW1M7yLD5t\/OKmTp2anj17rnR7AAAA\r\nAAAAAKwaH4kAvV27dtXlxadlX9zs2bOry4tP1V7bzoraWFE7y7Oib7QDAAAAAAAA0DA+ElO41w2l\r\np0yZsty6dd8AX\/x75LXtzJ49OzNmzFipdjbYYIOV\/v45AAAAAAAAAI3XRyJA33rrravLEyZMWG7d\r\nuuXdu3f\/QO0sXLgwkyZNWmobAAAAAAAAAKydPhIB+mabbZaOHTsmSR544IHl1n3wwQeTJBtvvHG6\r\ndOlSr2z33XevLi+vnccee6w6hXuvXr0+SJcBAAAAAAAAaGQ+EgF6pVJJ3759k7z35vijjz661HqP\r\nPvpo9c3yvn37plKp1Cvfc889s9566yVJrrvuupRSltrOtddeW13u16\/fh+0+AAAAAAAAAI3ARyJA\r\nT5IBAwakWbNmSZITTjghc+fOrVc+d+7cnHDCCUmSZs2aZcCAAUu00bx585x44olJkvHjx+eiiy5a\r\nos7o0aNz9dVXJ0l69+6dHj16rMrdAAAAAAAAAKCBNGvoDiTJQw89lIkTJ1b\/\/sYbb1SXJ06cWO+N\r\n7yTp37\/\/Em1sscUWOfnkk3PBBRfkscceS69evXLqqaema9eumTRpUoYMGZLHH388SXLKKafkU5\/6\r\n1FL7csopp+Smm27Ks88+m0GDBmXixIk5\/PDD06pVq9x3330ZPHhwFi5cmFatWmXYsGEfet8BAAAA\r\nAAAAaBwaRYA+YsSIXHfddUste\/jhh\/Pwww\/XW7e0AD1Jzj\/\/\/Lz22mu55ppr8vjjj+fwww9fos5x\r\nxx2X8847b5l9adeuXe6888706dMnzz33XIYPH57hw4fXq7Puuuvm+uuvz\/bbb7\/8HQMAAAAAAABg\r\nrfGRmcI9SZo0aZKrr746d955Z\/r27ZuOHTumefPm6dixY\/r27Zu77rorI0aMSJMmy9\/tbt265fHH\r\nH8+QIUOy0047pX379mndunW23HLLfO9738u4ceOy\/\/77r6G9AgAAAAAAAGBNaBRvoF977bVLTNP+\r\nYfTp0yd9+vT5UG20adMmgwYNyqBBg1ZRrwAAAAAAAABozD5Sb6ADAAAAAAAAwAclQAcAAAAAAACA\r\nCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAA\r\nAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAA\r\nIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNAB\r\nAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAA\r\nAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkA\r\nHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAA\r\nAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACS\r\nCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAA\r\nAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAA\r\nIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNAB\r\nAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAA\r\nAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkA\r\nHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAA\r\nAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACS\r\nCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAA\r\nAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAA\r\nIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNAB\r\nAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAA\r\nAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkA\r\nHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAA\r\nAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACS\r\nCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAAAAAAAACSCNABAAAAAAAAIIkAHQAA\r\nAAAAAACSCNABAAAAAAAAIIkAfbkmT56ck08+Od27d0+bNm2y\/vrrp2fPnrnooosyZ86chu4eAAAA\r\nAAAAAKtQs4buQGN155135ogjjsjMmTOr6+bMmZO\/\/\/3v+fvf\/54RI0bkrrvuyuabb96AvQQAAAAA\r\nAABgVfEG+lI88cQTOfTQQzNz5sy0bds2559\/fh555JGMHDkyX\/\/615MkzzzzTPbbb7\/MmjWrgXsL\r\nAAAAAAAAwKrgDfSlGDBgQObMmZNmzZrlL3\/5S3bddddq2d57751PfepTGTRoUCZMmJBLLrkkZ555\r\nZgP2FgAAAAAAAIBVwRvoi\/n73\/+e+++\/P0ly3HHH1QvPaw0cODDdu3dPkgwbNizvvvvumuwiAAAA\r\nAAAAAKuBAH0xt912W3X52GOPXWqdJk2a5Oijj06STJ8+vRq4AwAAAAAAALD2EqAvZtSoUUmSNm3a\r\nZMcdd1xmvd69e1eXH3roodXeLwAAAAAAAABWLwH6YsaPH58k6datW5o1W\/Yn4rfaaqsltgEAAAAA\r\nAABg7bXshPg\/0Lx58\/LGG28kSTp16rTcuh\/72MfSpk2bzJ49Oy+99NJK\/4wpU6Yst7xuW1OnTl3p\r\ndlmxhW+\/0dBdYC2xov+na4oxy8pqLGM2MW5ZOcYsa6PGMm6NWVaWMcvaprGM2cS4ZeUYs6yNGsu4\r\nNWZZWY1lzCbGLSunMY3ZtV3djHThwoVr\/OdXSilljf\/URur111\/PhhtumCQ57LDDcuONNy63focO\r\nHfLaa6\/lM5\/5TJ588smV+hmVSuVD9xMAAAAAAADgo27MmDHp0aPHGv2ZpnCvY968edXl5s2br7B+\r\nixYtkiRz585dbX0CAAAAAAAAYM0whXsdLVu2rC4vWLBghfXnz5+fJGnVqtVK\/4wVTfc+b968TJgw\r\nIR06dMgGG2yw3O+ww4cxderU9OzZM8l7T+9stNFGDdwjWD5jlrWNMcvaxphlbWTcsrYxZlnbGLOs\r\nbYxZ1kbGLWsbY5Y1YeHChXn99deTJNtss80a\/\/nS2TratWtXXZ41a9YK68+ePTtJ0rZt25X+GSv6\r\ntnqSdOvWbaXbg1Vho402WqmxCY2FMcvaxphlbWPMsjYyblnbGLOsbYxZ1jbGLGsj45a1jTHL6tSl\r\nS5cG+9mmcK+jZcuW+cQnPpEkmTJlynLrTp8+vRqgd+7cebX3DQAAAAAAAIDVS4C+mO7duydJJk6c\r\nmIULFy6z3oQJE5bYBgAAAAAAAIC1lwB9MbvvvnuS96ZnHzt27DLrPfDAA9XlXr16rfZ+AQAAAAAA\r\nALB6CdAXc+CBB1aXf\/nLXy61Tk1NTX71q18lSdq3b5+99tprTXQNAAAAAAAAgNVIgL6Ynj175nOf\r\n+1yS5Oqrr87o0aOXqHPxxRdn\/PjxSZKTTjop66yzzhrtIwAAAAAAAACrXrOG7kBjdNlll6VXr16Z\r\nO3duvvjFL+a0007LXnvtlblz5+bGG2\/M8OHDkyRbbLFFBg4c2MC9BQAAAAAAAGBVEKAvxQ477JCb\r\nbropRx55ZN5+++2cdtppS9TZYostcuedd6Zdu3YN0EMAAAAAAAAAVrVKKaU0dCcaqxdffDGXXXZZ\r\n7rzzzkyZMiXNmzdPt27dcsghh+S73\/1uWrdu3dBdBAAAAAAAAGAVEaADAAAAAAAAQJImDd0BAAAA\r\nAAAAAGgMBOgAAAAAAAAAEAE6AAAAAAAAACQRoAMAAAAAAABAEgE6AAAAAAAAACQRoAMAAAAAAABA\r\nEgE6AAAAAAAAACQRoAMAAAAAAABAEgE6AAAAa6kFCxY0dBcAAACAjxgBOgAAAGudf\/\/73+nTp08e\r\nfPDBhu4KAAAA8BHSrKE7AAAAAO\/Hiy++mL333juTJ0\/ORhttlJ49e6Zly5YN3S0AAADgI8Ab6AAA\r\nAKw1pk6dmj59+mTy5MnZfffdc\/LJJwvPAQAAgFVGgA4AAMBaoaamJhdeeGHGjx+fbbfdNpdddlm2\r\n22671NTU1KtXSmmgHgIAAABrOwE6AEADE\/QArJyampqMGTMmSfL5z38+O+ywQxYuXJgmTd67tP3X\r\nv\/6VUkoqlUpDdhMAAABYiwnQAQAa0KJFi6pBz7x58xq4NwCN26JFizJ\/\/vwkyauvvpoZM2akWbNm\r\nSZIf\/vCH+fKXv5wbbrihIbsIAAAf2tIetF981iUAVh8BOgBAA2ratGmS5MQTT8y5557bwL0BaNya\r\nNm2aLbfcMkkyZsyY\/PGPf0ySnH322RkyZEhefPHFNGvWzMweAI2IYzIfJcYza0JNTU31Qfs333wz\r\nY8eOTSklTZo0MQYB1pBKccQF1pCamprq9JrQ2Jn+lTXpV7\/6Vfr3758NNtggf\/nLX7Lddts1dJcA\r\nGq1\/\/\/vf2W233fLaa69lm222SZcuXapB+sUXX5zvfOc7ad68eQP3EoDk\/+4DzJ49O0899VQqlUo+\r\n\/elPp3Xr1g3dNVgpc+fOzb\/\/\/e+UUvKZz3ymobvDf4BFixZVH7S\/\/vrrc8stt+SOO+5Ir169cv\/9\r\n97tXBbCGNGvoDgAfPbUXyC+++GIWLVqUDTfcMG3bthWe06gt\/oCHCxLWlFJKFixYkObNm2fhwoUZ\r\nM2ZMtttuOw8d0SgZlzS0RYsWZfPNN8\/tt9+evn375sknn8yTTz6ZJPmf\/\/mffO9732vgHsKq9b\/\/\r\n+7954oknMmnSpKy77ro5+uij06VLl3Ts2LGhuwYrVBsCTZs2LWeddVbuuOOOzJkzJ9dcc0369OmT\r\nddZZp6G7CMs1bdq0XHDBBbnvvvsyefLk3HTTTfnCF77Q0N3iI6ympqYang8dOjQ\/+tGPsmjRomy2\r\n2WbZYostMnPmzLRv375hOwkryctJrO0E6MAqNW3atPzkJz\/JI488kr\/\/\/e+ZM2dOPvvZz+azn\/1s\r\nTjvttGy00UZp0aKFX6A0mLpP8i5t3eOPP55XXnklzz77bHbZZZdssskm2XjjjY1ZVptKpZL+\/fvn\r\nuuuuy8MPP5wLL7wwBx10UD7+8Y83dNegnrrHyieffDIvvPBCHnroocydOzc9e\/ZM586d07t372p9\r\nx01Wh9oHOHbeeed88YtfzG9+85s0adIkG264YTbccMO88847adeunfHHR8I555yTs846q966O++8\r\nM7vuumsGDhyYnXfeuWE6Biuh9rxhypQpOeywwzJ69Oh06NAhnTt3TocOHYTnNHpTpkzJEUcckVGj\r\nRqVdu3bp3r27B0lZrWqnaE+S888\/P2eccUaS5Pvf\/34OPPDA7L777g3ZPViq0aNHZ8KECbnrrrvS\r\nsmXL9O7dOzvssEN23HHHVCoVD+GzVjOFO7DKTJ48Of369cvjjz+eJGnZsmXmzZuX5s2bZ8GCBdl5\r\n553zzW9+MwceeKCnJVnjJk+enFJKNt1003ohUN0TuQsvvDBXXXVV\/v3vf6empiYf\/\/jH88lPfjLD\r\nhg3L5z\/\/+YbsPh9htePxj3\/8Y77+9a\/n9ddfz3nnnZdBgwYt8bAHNJS6x82f\/vSnGT58eJ555pm8\r\n++67Sf7vd\/7JJ5+cfv36Zdddd00iRGf1GTx4cE4\/\/fQkSdu2bTNr1qxsvfXWOfXUU9O3b9+su+66\r\nDdxD+HCGDRuW73\/\/+0mS7bbbLq1bt87kyZPz8ssvp0mTJtl8883zi1\/8InvttVcD9xSWVHuNNXny\r\n5Oy555554YUXst122+WUU07J3nvvnU9+8pMN3UVYrsmTJ+fzn\/98Jk2alG222SYDBgzIF7\/4xWy8\r\n8cYN3TX+A\/z617\/OMccck+S9t9C\/+c1vpl27dknMCEbjMmzYsPz85z\/Piy++WL03kCTbbLNNDjnk\r\nkOr1mnHL2sob6MAqMWXKlOrFxXbbbZdDDz00X\/rSl\/Laa6\/l1VdfzYknnpi\/\/e1vmTJlSl577bWc\r\ndNJJadGiRUN3m\/8QL730Urp06ZJmzZplwoQJ2XzzzbNo0aI0adKkegJ33nnn5cwzz6xu065du7z5\r\n5pt5880384UvfCE\/\/\/nP81\/\/9V9uyLPK1YaSn\/70p\/OJT3wir732Wh5++OFq6CiApKHVnUbw7LPP\r\nztlnn50k+fjHP56NNtoos2fPzrRp05IkF110Uf7xj3\/kyCOPTP\/+\/VOpVIxhVrkZM2bkhRdeSJs2\r\nbXLuuefm05\/+dI488sg8\/fTTGTJkSJLkwAMPrN5ohLXNc889lyuvvDJJcsEFF+SQQw5Jp06d8sYb\r\nb+Tkk0\/OyJEjM3HixBxxxBH5zW9+k7333ruBewz1NWnSJNOmTcvBBx+cF154ITvvvHN+9rOfZdtt\r\nt02zZv93K7LuDXXnCzQWr776ar785S9n0qRJ2XnnnfPTn\/402267bdZZZ53qODVeWR1KKZk5c2Zu\r\nueWWJMl\/\/\/d\/52tf+1q9c1ohJI3FmWeemfPOOy9Jsskmm2T77bdPmzZtMmrUqDz99NM588wz8+KL\r\nL+aqq65KkyZNhOisnQrAhzRjxozy5S9\/uVQqlbLzzjuXsWPHlvnz59er89\/\/\/d+lUqmUSqVSrrrq\r\nqrJo0aIG6i3\/aRYtWlQuueSS0q5du1KpVMpGG21UJk6cWEop5d133y2llHLzzTdXx+dpp51Wfve7\r\n35Wnn366DBo0qOy6666lUqmUpk2blosvvrhMnz69AfeGj7rrr7++OhYvv\/zyhu4O1DNs2LDq+Dzj\r\njDPKqFGjyjvvvFPefPPNct1115Vjjz22Wr7jjjuWESNGNHSX+Qh7\/vnny0MPPVQ957zvvvvKhhtu\r\nWCqVSvn0pz9dfvWrX5W33367gXsJH8w999xTmjZtWo4\/\/vjyzjvv1Ct7++23y+mnn1423XTTUqlU\r\nyic\/+ckycuTIBuopLKmmpqYsWrSo\/OhHPyqVSqVstdVWZdSoUfXqLH4\/oKampsybN6+6DA1l\/vz5\r\n5fvf\/36pVCplm222WeHYXfzel\/HLhzV27NjqNdX111\/f0N2BpRo6dGh1nP7whz8sDz\/8cLXsnnvu\r\nKXvssUdp2rRpqVQq5cgjj6yWyQNY23gDHfjAyv\/\/xO3jjz+ev\/\/979lkk01y7rnn5rOf\/Wxqamqq\r\n9X70ox\/l6quvTvLeFNlHH320J85YY5o0aZLDDz88c+bMydVXX50XXnghn\/vc5zJq1Kh07do1STJy\r\n5Mgk772FPmDAgLRu3TpJ8uMf\/zhjx47N4MGD8+c\/\/zmDBg1Kknzta1\/zGQJWWt2pr2st\/uRt7fF0\r\njz32yD777JORI0fmT3\/6Uw466KB07NhxTXcZljBu3LiMGDEiSXLWWWdl4MCBadOmTbX8qKOOyuGH\r\nH55u3brl9NNPzz\/+8Y9ce+212XjjjfP\/\/t\/\/a6hu8xFQlvGmV5cuXbLppptWv6u355575qabbsph\r\nhx3mTXTWes8++2xqamqy9957p23bttX1NTU1adeuXX7wgx+kSZMmue666zJ58uQcccQRuf76672J\r\nTqNQqVRSqVQyatSoJMk+++yTHXfcsVpe\/v9v\/L700ku59957c9ttt+Xll1\/Oeuutl+9\/\/\/vZd999\r\nG6rrkHfffTePPPJIkmS\/\/fbLDjvsUC2rvYZ75ZVXMm7cuNxyyy158803s+2222bvvffOnnvu6e10\r\nPrDacfOvf\/0rSbL55pvnwAMPrFcGjcEf\/\/jHDB48OEkyZMiQfPOb36w3W+eCBQvyxBNPVGeyu\/76\r\n61OpVPKrX\/3Km+isdQTowAdWe\/J25513Ztq0adl\/\/\/3To0ePJP83pdAZZ5yR\/\/mf\/0mSXHrppTn+\r\n+OOzzjrrLNGWX56sThtttFH++7\/\/OzU1NfnlL39ZDdHvv\/\/+bLHFFrnjjjuyzTbb5NBDD62G5zU1\r\nNWndunV23333XHDBBWnSpEn+9Kc\/CdF5X0op1fD8lltuSYsWLXLAAQcscbyrPZ526tQpu+22W+65\r\n557ce++9efLJJ9OxY0cXzDS4p59+Ok899VTat2+fL33pS9VjZa1KpZLmzZvntNNOS7NmzfKDH\/wg\r\nDz\/8cH73u9\/lS1\/6kvHLB1L3\/HDatGmZMmVKJk6cmHnz5mW33XZLu3btstFGG1XrCNFZ29WO+Xbt\r\n2qVdu3bZY4896q2vvenYpk2b6jmpEJ3GaOrUqRk3blySZLvttkurVq2qZfPmzcuYMWPy7W9\/O6+8\r\n8krefvvtatnIkSPz61\/\/OkccccQa7zMkyRNPPJG\/\/e1vad68efbaa696D4xWKpU88sgjOemkk\/LS\r\nSy\/ltddeS5L84Q9\/yMiRI\/Ptb387Rx55pPNeVsri1\/i1y3PmzEny3qcEnn\/++Xz6059+32NqaQ\/x\r\nw6owc+bM3HzzzZk5c2a+853v5LjjjqsXnt9+++057rjj8vbbb2f33XfPJptskptvvjm\/+c1vUkrJ\r\nr3\/9ayE6axWjFPjASilJkueffz7Je0\/n1g0UzzjjjJx\/\/vlJlgzPFy1alHfffTd\/+ctfkrwXuC9a\r\ntGgN9p7\/NB06dMg3vvGNHHvssenSpUteffXV7Lnnnpk4cWI22WSTbL311unWrVu1fu2JXKVSybbb\r\nbpvBgwdn3333TU1NTQYNGpRrrrkmM2bMaKC9YW1Re6F70kkn5bDDDsvXv\/717L\/\/\/nn00Ufz6quv\r\n1qtbewz8wQ9+kF69emX+\/Pk5\/fTT8+qrr7oJQ4OpHZd33313kqRr167Zeeedlzoma2efGTRoUE48\r\n8cQkydVXX52bb755DfWWj5JFixZVfxePGDEi\/fv3zx577JH\/+q\/\/yte+9rXsueeeOfDAA\/O73\/2u\r\n3na1IfoGG2xQDdFvu+22vPPOOw2xG7BSbr311pxzzjk56qijcuqpp+bNN9\/MO++8k9GjRyep\/73T\r\nxUP0Y445JptsskmmTZuWI444Ivfee29D7QZUNW3atDpun3zyyer6++67L2eddVb69OmTCRMmZN11\r\n182OO+6YXr16pXPnzkmS\/v37Z+zYsQ3Sb9h0002z6aabZsGCBRk5cmRmz56dJHnooYdy1lln5fOf\r\n\/3zGjh2bSqWSLl26pHfv3kmS0aNH58Ybb8zrr7\/ekN2nkau9Xlq0aNESgXntdVfdlzqmTZtWb7vl\r\nuf\/++3PEEUdU3\/qF1WHixIm59dZbs\/HGG+fQQw\/N+uuvX80H\/vznP+e4447LW2+9lQMOOCAPPvhg\r\nBgwYkB133DFNmjTJ9ddfX31ArvZ8Fhq9hpg3HvhoWLhwYampqSmf+9znSqVSKWeeeWa17PTTT69+\r\nC2XYsGFlwYIF1bK63zvZaaedyle\/+tU12m\/+s7366qvlnHPOKZtttlmpVCqlffv2Zd111y3f+c53\r\nSinL\/mZZTU1N+ec\/\/1n69Onjm+i8L6+\/\/nr5xje+UdZZZ53Srl27UqlUyqabblr23HPPcuedd9b7\r\ntumCBQvKggULyllnnVWaNm1aNtlkk\/KnP\/2plPLeMRdWt8WPgbV\/P\/7446vfMZ01a1Z59913l9vO\r\nqFGjSteuXUuTJk3K8ccfv9S2YVnqniueddZZ1XPKSqVSPvaxj1WPpbV\/Tj\/99PLss8\/Wa8M30Vlb\r\nnHvuuaVZs2b1xnTtGD\/nnHNKKUv\/XmTtulmzZpUzzzyz+k30zp07V88doCENHjy4OqYPOOCA0rdv\r\n37LeeutVx\/uBBx5YHnzwwTJ37tyyaNGiMmTIkLLuuuuWSqVSRowY0dDd5z\/U66+\/Xg444IBSqVRK\r\nt27dSt++fcvxxx9fNtpoo7LOOuuUSqVSvvzlL5c\/\/vGP5eWXXy6LFi0qp556anWs33333Q29CzRC\r\nzz\/\/fJk9e3YppZT58+dX15999tllr732KtOmTauue\/XVV8sWW2xRKpVK2X333cvUqVNLKcu\/lpox\r\nY0Y5+uijq\/dgYXX529\/+Vjp06FAGDBhQb\/0\/\/\/nP8olPfKJUKpWy\/\/771yv7yU9+UiqVSmnSpIlv\r\norPWEaADH1ptWH700UeXUkr50Y9+tMzwvO4J3\/Dhw6tB5AsvvLDG+81\/rtoQfZNNNqmO1T322KPe\r\nRcvSLC1Ev\/TSS8tbb721hnrO2mzUqFHlvPPOKxtvvHG9m+SHH354+clPflJK+b9j5LPPPls+\/vGP\r\nV28uwupUO+7qPqQxY8aMUsr\/XdDWDTEfeuihlWp3r732KpVKpWyzzTYrDNxhaYYOHVoddyeddFK5\r\n6aabyrhx48ojjzxSjj766PLZz362Wn788ceX8ePH19t+8RD9N7\/5TZk5c2YD7Q0s6ZJLLqmO4W22\r\n2absvffe5WMf+1g1pGndunV58MEHSykrF6J369at+rDT7NmzPbjEGldTU1PvfPbb3\/52vfPeSqVS\r\ndt111zJ48OAltp0xY0b1Iedzzz232h6sbouPs0cffbR07dq1NG3atN7Y3W677cqPf\/zjJbafMGFC\r\n9SGm22+\/fQ31mrXFPffcUzbbbLPygx\/8oN55aO291CZNmpS77rqrun7mzJnlsMMOK5VKpXzyk58s\r\nZ511VvWe07KOibU\/o3PnzuVvf\/vb6t0h\/uONGzeuTJkypfr3qVOnls985jOlUqmUz3\/+89WHRebN\r\nm1dKKWX27Nmla9euZb311que47rPxdpCgA6stGXd\/L766qtLpVIpLVu2LAcddFD14uLSSy+t92Rl\r\nXc8++2z58pe\/XJo2bVp++MMfllJcHLNm1YbonTp1KpVKpay33nrVp8WX96bv4iF6pVIpP\/3pTz01\r\nyVLV1NQsMTYmT55cBgwYUPbYY496T+H26dOnXHHFFeXll18upZQybNiw0rJly9K0adNy0003NUT3\r\n+YiqHZMvvfRSNSiv+7Db+eefX\/r161fv4bZRo0ZVHzo69NBD610wL662rRNOOKFUKpXSq1ev1bEb\r\nfMT99a9\/LR06dCiVSqVccMEFS7w9Pnfu3PLnP\/+59OvXr\/r7eODAgdVZPWrHed0QvWPHjuXGG290\r\nzkmj8NRTT5XNN9+8VCqVMmTIkPLvf\/+7lFLKc889V775zW9Wy9q0aVPGjh1bSllxiH7yySeXbbfd\r\ntvzrX\/9aczvCf6SVvfZ58cUXy09\/+tPSu3fvss8++5QrrriijBs3rlpe9x7DyJEjS8uWLUulUjGL\r\nAg2i7n2AMWPGlG9961tlt912KzvuuGO5+OKLy6OPPlotrzt2f\/e731XPRUaPHr1G+0zjVVNTU6ZP\r\nn14++clPVmc0qH046JxzzqmOmUsuuaTetVgppTz55JPV2Wi22GKLMnjw4OoLH3WPv4sWLSpPP\/10\r\ndWbQQw45xCyJrFKTJ08uTz311FLHVe011a9\/\/evStm3b0q1bt\/LII4+UUv5vnNbW6dq1a+nWrVt1\r\npoRKpVK99wWNmQAdWCn\/\/ve\/yw9\/+MPyxBNPVNfVPWnbb7\/96j2Ze8UVV1SfNCulfjg+d+7c6nRu\r\nXbp0Kffcc8+a2Qn+46zoxk5tiF77tHiHDh2qU8CuKER\/4oknSq9evUqlUilPPfXUKu03a6eVCWRq\r\nL4znz59fpk+fXs4+++yy8847V6eybNu2bdl8883Lb3\/72\/Kzn\/2sdO\/evVQqlXLiiSeu7u7zH+ZP\r\nf\/pT2XrrrcvgwYPLG2+8UV1f+yZE69at6\/1+njFjRundu3epVCqlU6dO5bLLLlvu7BuzZ88ue++9\r\nd6lUKuXggw9erfvCR9OQIUNKs2bNyg477LDE9Oy1x9uampry1FNPla985SvVc9Bf\/vKXS7R1\/\/33\r\nV98imzhx4proPqzQn\/\/859K0adPyrW99a4kHRF5\/\/fUyZMiQstVWW72vEH327Nnl9ddfX\/2d5z9a\r\n7XXSG2+8UW6\/\/fby\/e9\/v3zve98rp5xySvnDH\/6w1Fm9Fi5cuMTYrXu9NXPmzHLaaaeVJk2alN13\r\n3708\/\/zzq3Uf+M82a9as8sILL5Rrrrmm\/OxnPyu\/\/vWvy1NPPbXECyBz584tCxcuXOKct+7YnT59\r\nejnppJNKpVIpX\/ziF+udV0Mp71131b64sfnmm1cfpF9WeF57rLznnntK69atq\/dOv\/KVr5R\/\/etf\r\nZc6cOaWUUqZMmVJuuummsvvuu5dKpVK23nprx05WqRtuuKHsu+++5ROf+EQ5\/\/zzqw\/fL+6YY44p\r\nlUql7LLLLksN2l999dWywQYblC996Uvlz3\/+c\/n6179enn766dXce1g1BOjACr322mvVk7sTTjih\r\nXlhY+9TtH\/\/4x7LllluWSqVSmjdvXm655ZZ63\/Wt9eabb5af\/vSn1fYuvPDCNbYf\/Gepe4Pmb3\/7\r\nW\/nJT35Sfvazny1xMrf4N9E32mij6s31FYXoTz75ZHnxxRdXS\/9Zu9QdK88880y55557ypAhQ8q5\r\n555bHnjggTJhwoRq+eJB+\/jx48uNN95YPvWpT1W\/GdWuXbuy2267lY997GPV4+X999+\/xvaHj66a\r\nmpry9ttvl1atWpVKpVK23Xbbctlll5VS3vsGX+14u\/jii6s3c2qPp88991zp2LFjqVQq5VOf+lS5\r\n4ooryquvvlqtU3dsP\/LII6Vr166lXbt21e+YeuuXlbFo0aKyYMGCsu2225ZKpVK+8pWvLLd+TU1N\r\nefjhh6s3Izt06LDUt29HjRpV71gMDeW8884ro0ePrn7O6uabb65XXnusfOutt8pFF130vkN0WJ1q\r\nz3lffPHF0qtXr+onh2r\/rLfeeqVr167lD3\/4Q3nttdeq2y1+nlB3vM6aNatcfvnl1TZqz0tgdZgy\r\nZUr56le\/Wrbeeut6Y3edddYpxxxzTPn9739frbt4sFlK\/bE7Z86ceve3rrzyyjWyD6wd6h7z7rvv\r\nvrLRRhvVG3NDhgwppSz993fttn\/605+qM3PUHmN79epV+vXrVzbddNPqMbhz587Oc1mlLr744uqM\r\niO3atSsDBw4sc+fOrVenpqamzJ07t3zxi19c4tvmtecLNTU15ZZbbqlXXveFO2jsBOjACs2dO7f6\r\nNFmlUinf+ta3lnjjdubMmWXIkCGla9eupVKplBYtWpQTTzyx3HjjjWX69OnlnXfeKTfeeGM5\/vjj\r\nq+2cfPLJ1e3d8GFVqhtmXnHFFdWHO2q\/Sbb4Sd8HDdGhlPpj5Oc\/\/3nZaaedSosWLapj7mMf+1jp\r\n3Llzue6665a5XSmlPP\/88+VXv\/pV9a3dxW9GPvfcc2tkf\/jP8Mgjj5R11123+t3dL3zhC8v9BEvt\r\n7+k\/\/OEP1WkIu3TpUr773e+Wxx9\/vFpv9uzZ5W9\/+1v1++c777xzeeWVV9bkrvER0aNHj1KpVEr\/\r\n\/v1LKUu\/iV1r\/vz55cc\/\/nH1AaTam98e2qCxGTp0aKlUKmXTTTctJ510Utlkk02qn8uoe17wQUN0\r\nWJ1qx+WUKVOq11cf\/\/jHS+fOnUuPHj1K27Ztq+fA66+\/fjnttNPK+PHjl9vmP\/\/5z3LGGWdUz0EG\r\nDRq0xM+DVeXFF18sW2yxRfUThC1btizt27evhpDrrLNOWX\/99cvQoUOr2yzrWPvUU0\/Ve\/j01FNP\r\nrZYZu9SqOxa++tWvVj\/h9vGPf7ycccYZ1W9FL+++09ixY0vv3r1L586dl7hPsMkmm5R9993XDEus\r\nUmeeeWZ1jH33u98to0aNWm79U089tXrv67bbbquuf\/fdd8sTTzxRdt1111KpVMovfvGLUopjJGsX\r\nATqwTG+\/\/XZ5+umny\/XXX19++9vfVsPxSqVSvv3tby8Ror\/55ptlyJAh1TeG1llnneoJXW0wWTt9\r\n5mmnnVbdTkDJqlT3Arfud6UOPPDAcsEFFyzzRE2IzgdRd7ydddZZ1fG26aabli984QulR48e1U8E\r\nVCqV8uMf\/7j6xm5di4\/LK6+8shx11FGlUqmUdddd12cCWKVqx+0\/\/vGP6pvotX8GDx5cSln2Re38\r\n+fPL73\/\/++obFK1atSpt2rQpRxxxRDn++OPL3nvvXb0xudFGGy0x9TasrD59+lSnulzacbNW7Vh9\r\n8803y8Ybb1wqlUo59thjSykCRhqXuXPnlp\/85CfVa6raa6W6NxrrWpkQ3Tkqa9rs2bOrIVDPnj3L\r\nLbfcUl566aUye\/bs8uSTT5Yzzjijej9g3XXXLSeeeGJ55pln6rVROyX22WefXXbbbbfqOciPfvSj\r\nenVgVXrllVfKNttsUyqVStlpp53KL3\/5yzJ+\/PjywgsvlJEjR5ZDDz20elyuVCrlnHPOqW5bez4x\r\nf\/78MmPGjPLTn\/607LPPPtW67m+xItddd111vNQ+xNylS5dy1llnlVmzZpVSlj+7zCuvvFIeeuih\r\ncuKJJ5YjjzyyHHnkkeV73\/teeeihh3y6hVXq4osvro7VoUOHljfffLNaVvf4VndmmVtuuaV06NCh\r\nNG3atOywww5l2LBhZfTo0eXiiy+uhuc77rijb56zVhKgA0v10ksvlb59+5YOHTqUSqVSmjVrVv32\r\nTu2f73znO0uEOm+\/\/Xb561\/\/Wvbff\/9qWF73z5e\/\/OXqE2eluLhg9bnwwgur4+7cc88tkyZNqpYt\r\n64a6EJ0P6tJLL62Ot7POOqv84x\/\/KKW8NyXlv\/71r9KvX79q+eWXX77M8bT4+jvuuMNUbKxWX\/va\r\n16oPuH3yk58sQ4cOrX7bbHnh4z\/+8Y\/ymc98prRr126J3\/Vt27YtO+200xI3zGFl1N6I+eEPf1gq\r\nlUrZYIMNynXXXbfc38MLFiwo8+fPLzvssEP1HBUao+nTp5err766eq7ZvHnzMnDgwKV++qqUZYfo\r\n7du3L3\/729\/WZNf5D1b3fGDq1Kllk002KVtuuWX5+9\/\/Xi2rPUbPmjWrjBkzphqMr7vuuuWcc84p\r\nb7\/9drWNZ599tgwcOLB63vDpT3+63rTtrrtY1RYsWFC++93vlkqlUrbbbrsyduzYpZ7nXnTRRdWQ\r\nvXZWprpefvnl0qtXr+qsi5tttlm9OsYutRZ\/GPnZZ58tX\/jCF8o111xT7rrrruq91toQvfZN9OVN\r\n5w6r2wMPPFA22WSTUqlUyplnnll9uKOU\/\/uEa63Fx+Upp5xSnWGhUqmU1q1bV5c7duzowXrWWgJ0\r\nYAmTJ0+uvj229dZbl9NOO63ccsst5bbbbiv\/9V\/\/Vbbffvvlhui17rzzzjJixIgyaNCgcuGFF5YH\r\nHnig3venXVywutxzzz3VtyPPO++8MmfOnGrZii4+lhai14bvxixLM2rUqOpFxuDBg6vjrfbi95ln\r\nnikbbLBB9anbp59+uiG7C1VXXXVV9fd58+bNS6VSKd27dy8XX3xxeeutt0opSz9m1q574403yogR\r\nI8pRRx1Vtt122\/LpT3+6HHzwwWX48OGeLudDe+aZZ0r79u1LpVIpu+222wofyJg+fXr1zd66nwmC\r\nxmb69OnlqquuKptvvnmpVCrlk5\/8ZPnrX\/+6zPqLh+i14c7GG29c5s2b58Y6q1XtDfOpU6eWMWPG\r\nlDvuuKNUKpVy9NFHVwOfpXnuuefKLrvsUp3m\/cEHH6xXftttt5U+ffqUs88+uzz88MPV9a63WB3m\r\nzZtXevbsWX3YefHPwtQNhn7xi19UH1bq0qVL+fOf\/1yv7m233Vb93MA999xTXW\/sUqtuCD558uTy\r\nxBNPlFLem8Gjdqz99a9\/fV8h+tLaLkW4zqp1xRVXlHXWWadss802Zdy4cdX1dcfdQw89VC6\/\/PLy\r\n+c9\/vvTv37\/8\/Oc\/r5adccYZZccdd6zeY9h4443LXnvtJTxnrSZAB+p56623qt8t7dGjRxk7dmy9\r\n76DOnz+\/jB49uhx22GHLDNEXfyptaZzksTrUjquzzz67NG3atPTs2fMDvb27eIjevHnz8vzzz6\/i\r\n3tLY1X1TZnl+8pOflGbNmpV99923Ok5qb6A8++yz1e9F77HHHt4mp1GZNm1a2W233cpVV11VHn74\r\n4epMM7Uheu1Db0v7nb34zZvZs2fXe1gJVoUrrriitGnTplQqlbLPPvtUvxVdSv1pA2tqasof\/\/jH\r\nsv7665eOHTuWe++9t7oeGqPp06eXESNGlG7dupVKpVI6d+5cRo8evcz6tWN5+vTp5Zxzzik9e\/as\r\n3pCH1W3ixImlZcuWZb\/99itDhw4tzZo1Kz\/5yU9WuN39999fDSJ79OhR72H6Ukq9aWFL8dkNVp9H\r\nHnmkev+qNvRe\/Byh7vg799xzq99J\/+EPf1hKee\/6rrbOtGnTlrkt\/9nqPkhx4403ln333bd8\/OMf\r\nL+edd16ZOXNmvbrvJ0R\/4403VmqWMPigampqyle+8pVSqVTKvvvuW11Xyntjbs6cOWXgwIHV+6R1\r\n\/wwaNKjaztNPP13uuOOO8stf\/rI89thjS\/yuh7VNkwDU8cQTT2TChAlp3bp1jj\/++Gy33XZp3rx5\r\nkqSmpibNmzfPLrvskp\/\/\/Oc5+uijkyQ\/\/\/nP87Of\/SxPP\/10kqRZs2YppVTbLO89rFPv51QqlTW0\r\nR\/yneeedd3LNNdekpqYmPXr0yJZbbvm+2+jQoUO+8Y1v5Ljjjsu6666bd999NwsWLFgNvaWxmjhx\r\nYjbddNNcfPHFy6xTU1OTRYsW5Ve\/+lUWLVqUnXfeOV26dEkpJU2bNs3EiROzxx57ZNq0adljjz3y\r\ni1\/8YonxOH369Ory4sdJWJ0WLlyYDTfcMPfcc0+OOuqo7LbbbnnggQfSqlWrTJgwISNGjMg111yT\r\nGTNmpFKpLDE+mzSpfxnRokWLtGzZMomxzKpz2GGH5dhjj03Lli0zcuTIHH300bn77rvz1ltvpUmT\r\nJqlUKlmwYEGefPLJXHTRRZk+fXq22WabbLvttkmcb9JwlnUcrKmpSZK0b98+Bx98cH7wgx+kW7du\r\nmTJlSg499NA8+uijS92u9jjcvn37nHjiifnTn\/5UHeewuv31r3\/N\/Pnzc9ddd+Waa65Js2bN8vbb\r\nbyd573xiWbbbbrvssssuSZLXX389r732WpL\/+3+w\/vrr16u\/+LkFrCqLFi2qLs+cOTPJkucITZo0\r\nqY7N008\/Pfvuu2\/mz5+fn\/\/853nllVfStGnT6hjdcMMNl9gWFi1alKZNmyZJLr300hx77LH5y1\/+\r\nkgULFuStt96q3lutPUfYZ5998pvf\/CYbbrhhXnzxxVx77bW58MILM3v27DRp0qQ6bidPnpxjjz02\r\n++23X9544w3jjdWiUqmkdevWSd47Ti5cuDCVSiWzZs3Kb3\/72xx00EG55JJL8tJLL2X99dfPjjvu\r\nWD0WXnjhhbniiiuSJN27d89+++2X\/v37Z8cdd1zidz2sbRxxgXoeeuihvPrqq2nVqlX22muv6slf\r\nUv+iYP3118+QIUPSr1+\/JMkVV1yRn\/70p9UQve7FSKVScQOTNaJSqVQf4FhnnXWyxRZbJMlKh991\r\nL6w7dOiQr33ta\/nRj36UZ555ptoWH33z5s3LmWeemRkzZuSUU06pXggsrkmTJmnatGlqampSqVTS\r\ns2fPJO+Nw4kTJ+Zzn\/tcNTy\/8sors9VWW1W3LaVk4cKFueqqqzJmzJjqdrA6LC3IadasWWr+v\/bu\r\nPLqmq\/0D+Hffm0kGRAiJmZrnoebGPBVFzEOrqrRmamgJJWbVUBrUUEqVqBJqeFNDWjHTag1piSmT\r\nRBARmYd7n98ffve8uRKp9pUE+X7Wspres8\/JPmvtnHv2fvZ+ttGIAgUKwNraGkajEQ0bNvxHQfSY\r\nmBhtMNwUzATYlun5cXR0hIeHB4YMGQJbW1scO3YMY8aMQa9evbBy5UqsW7cOEyZMwJAhQxAQEABX\r\nV1esXLkSTk5OeV11yufCwsJw4sQJbNy4Ed7e3jh58iRu375t1p8yBdE\/\/vjjZw6iA0ChQoU4GEk5\r\nKmOfCAA++OADbVLp1atXtWB6ampqpsnzGRUuXBiDBg2CXq9HSEgITp06BYDBRsp9Tk5OKFiwIGxs\r\nbPDXX38ByHryh06n0z5\/8803odfrkZ6ejsjIyFytL718jEajNn46e\/ZsTJo0CcnJyfjwww+xf\/9+\r\neHl5aZONM\/arsgqiL1q0SAvGBwcHY\/jw4di3bx9CQkK4sINy1JAhQ2Bvb49Tp06hY8eOmD59Otq2\r\nbYvx48fjp59+gpWVFZYuXYr9+\/fj3Llz8PLy0sa5Dh06BIPBoE1EInpl5P6idyJ6kS1atEjb9zk4\r\nOPhv93Hy8\/MzS9\/y4Ycfcn9fylMxMTHi5OQkSin54IMPnukcU1qiq1evZkqrxb3M8p\/09HQ5cOCA\r\ndO3aVXu2ZdzX6UmtWrUSpZQsXbpURB6nrDKlbW\/ZsqX89ddfZuVN7e3MmTNiZ2cnTZs2lbCwsJy7\r\nIcrXMj7DEhMT5c6dO5nam6mMKR3guXPnnprO3VQmJCRE3N3dpUuXLmy\/lOPu3bsnCxculIIFC2ZK\r\nGWj6V7169b\/dJ50oN6xevVpatGghFhYWWvssUqSIlC5dWjZv3iw3btwwK29K516pUiVRSkmZMmWy\r\nTedO9Dxk1ccxGo3a57dv3zbb31lEZPHixVqbLlq0qHh7e2vln5YO+\/Lly+Li4iJKKfnuu+9y4laI\r\n\/pbRaJS6deuKUkrKli0rd+7cEZGn\/x2IPE77XqBAAdHr9fLLL7\/kan3p5bV06VLtOfnZZ5+Zpa\/O\r\n2N4MBoNZKvZDhw5pz0pHR0fp3LmzzJo1S5o0aSJKKXFycuJYK+W4pKQkmT9\/vjg4OIhSSnuXdXV1\r\nlU6dOsmvv\/4qIubf+X369BGllDRr1kzS0tK4hRa9cjjtkyifi4qKMlvlYJoN\/uDBA0RFRUGv12eb\r\nirVNmzYoU6aM9v9r1qzB+vXrERoamnOVJnoK0zYDFSpUAADcuHFDS9GW3SxIpRSCgoLQrl07LFu2\r\nDCkpKdqxjFkYKH\/Q6\/Xo0KEDJkyYgI4dOwIARo8enWkluml1jouLCwDg559\/xs2bN9G2bdunrjwH\r\nHre3mJgYrFq1ComJiXB1dUWpUqVy4c4ov8mYRnDt2rV4++23Ua9ePTRu3BjDhg3Dhg0bAEBbXWNK\r\nXZnVSvQ1a9YgLi4OOp0Ot27dwogRI+Dr64srV67AwsIiL2+T8oGiRYti6tSpOHLkCLp27Yo6depo\r\nWWfeeOMNfPzxx\/Dz82O2GMpznp6eGDVqFE6cOAGlFMqUKQNra2vEx8cjPDwco0aNwpw5cxAQEKCd\r\n8+RK9LCwsGxXohP9rzKulPziiy+0bEgZVzw2bdoU3bp1w8mTJ7Xzpk6dikWLFgEAoqOjsWvXLvj7\r\n+2vZmDKOG5jGFa5fv4579+4ByJz2miinZOz7GwwGKKUwcuRIFCtWDKGhoRg2bBhiY2Oh1+szZVww\r\nZfu4fPkykpOTAQDFihXLvcrTSysgIABffPEFAGDmzJkYNWqUljEmPT3dbGxJKWWWjcO0Er169epI\r\nTk6Gn58f5syZgzNnzqBChQo4ceIEqlWrlqv3Q\/mPjY0Nxo4di9WrV6NSpUqoVasWunTpglWrVmHD\r\nhg1o0KCB9p0PAAkJCYiKigIAVKxYERYWFsxGR6+evI7gE1HeCQkJkfLly0udOnXk2LFjIvJ45WSF\r\nChVEKSU9evSQu3fvPvX8lJQUERFZsGCBFClSRFq0aKHNtFy8eLGIZJ6JTpQbMq6OWLZsmfZ5xhm+\r\nGSUnJ8uXX34pSinp2LGj1rYpf0tPT5fDhw9Lp06dslyJbnq+BQQEaDN07ezsRCklrVu3lkuXLmV5\r\nXaPRKPv375dy5cpJsWLFxMfHx+x6RM9Dxvbk6elpNoM844rIoUOHauXS0tJEJOuV6GXKlJEePXqI\r\np6enNGvWTJRSUqxYMQkMDMzdG6N8LyEhQdLS0uTq1aty7do1Eflv2yXKS0uWLNGer5MnT5a9e\/dK\r\naGionD171mwVmY2NjXTp0kV+\/vlns\/OfXIleoUIFCQgIyJuboXyhZ8+eopSS3r17y7lz50RE5Nat\r\nW1K6dGlRSkmLFi3k+vXrmc7L2Na7du0q\/\/nPf7SVlcnJyVq5hIQEmTp1qpYl5MmsTES56dq1a9Ku\r\nXTvR6XRiY2Mjb7\/9tpZhKT093ezdOTY2VkaPHi0WFhbSp08fjg\/QM\/nqq6\/EyspKatWqJRcuXNA+\r\nzzgOdfz4cfH29pa2bdvK0KFDZe3atWbX+PXXX2XChAlSvnx5qVu3rrz33nty8+bNXLsHIpOEhARJ\r\nTU01+8xoNJo9K48cOSLlypUTR0dH2bZtm1aG6FXCADpRPnX37l1p3ry5KKWkQYMG8u2330pycrLc\r\nv39fOnbsKEopKV++vKxevVri4+OzvdaECRNEr9fLb7\/9JsOGDdM6035+frl0N5RfmF7EMr6QmX42\r\nGAzaz0FBQdK2bVutLX7zzTdm5Z98oTt\/\/rzUrVtXLC0tZfny5XzhI01aWpocOnRI2rdvr7WnlStX\r\nmpW5d++evPPOO2JpaSlKKSlVqpRcuXJFRP47GJOx0xwYGKhNOOrevbvcu3cvV++J8hdvb2+t7fbq\r\n1UtGjhwpY8aMkaJFi4qVlZUopaRLly5a+SeD6L\/++qs2kJ7xX8WKFbV2TpSbMr4LZPVeQJQXjh8\/\r\nLmXKlBGllCxcuFDi4uLMjqekpEh4eLi2PYyNjY307ds302Q7UxC9WrVqopSSmjVrSlJSUm7eCuUT\r\nycnJ0rRpU1FKScGCBWXQoEGyb98+rR03b978qZNBRUQ+\/\/xz7Z2gefPmMn\/+fLPgeXBwsHzxxRda\r\nmXnz5uXGbVE+FR0dLQcOHJBPP\/1UJk+eLLNnz5ZTp05pqdpNjh8\/rm1BaGVlJW3atJHg4GCziXhR\r\nUVHa5HqllHz11Ve5fTv0EjIajdK7d29RSknnzp21z0Qe96sSExNl0qRJZltgmv5Nnz7d7FoGg0Hi\r\n4uIkOTmZkzfohWAaG8jY97p8+bK88cYbopQSNze3TM9bolcFA+hE+Yzpy87UIWjcuLGcOXNGEhMT\r\ntTK\/\/\/67tuKsfv364uPjow0CPRl8vHPnjnTo0EGsrKwkKChIgoKCpGXLltqM9Xv37nFQk56LjPtF\r\nRUVFyZUrV+TKlSsSHh6eZfnly5drA0CWlpayevXqTGUSExPlt99+0\/awdnNzk4iIiBy7B3p5PJmt\r\n4Oeff5a+fftqndwvv\/zS7Lifn59Uq1ZNdDqdKKWkf\/\/+8uDBA7MZu48ePZJffvlFe0aWK1cu0z6o\r\nRM+L0WiUiIgIqV+\/viilZMmSJWaTNQ4dOiT9+\/cXe3t7s4EekcxB9MDAQHn33XelcuXKUrNmTa6E\r\nICJ6gqlvVbFiRbPMHFn1g3r06CFKKbG1tZUlS5aIiPl7x8OHD8Xb21saNmwof\/zxR85XnvIdU3uL\r\nj4+Xbt26aVmUTGMAb7zxRrbBc5OMQXRLS0upXLmy9O7dW\/r16yfVq1fXjn388ceZfjfR8xIaGipu\r\nbm5SrFgxs6CktbW1dOjQQTZv3mxW3t\/fXypVqqRNfnZ1dZW3335bvLy8ZNq0aeLu7p5l2+W4Fv2d\r\nd955x2wvaBGRuLg4+fbbb7WsdhYWFuLk5CQNGzaU4sWLa21tzZo12nXY1uhFZGqXMTExcuDAAW1R\r\nXsmSJbWsYESvIgbQifIZUxBy0KBBYmVlJb6+vlke\/+6776RAgQKilJK6deuKl5dXpsBiXFycNljU\r\nvHlzefjwoaSkpMiUKVNEKSWlS5eW27dv58p90astY\/Dc29tb3NzcxN7eXhwcHKR27doyd+5cSUhI\r\nMDvHaDTKjBkzxNXVVeuUDB06VFasWCGnT5+Ww4cPy4QJE6RevXpaeuKsUhRS\/pOxvf3++++yb98+\r\nmT59ugwePFicnZ219uTt7W12no+Pj5QvX14bjKlTp44MGTJEvvzyS\/H29pYuXbpIxYoVtYEaprGk\r\n5y1j2xURuXTpkiil5J133pHo6OhM5X\/\/\/XcZMWLEMwXRk5OTJTY2Vh49esSVEERE\/y89PV3S09Ol\r\nTZs2mTJ6ZFVW5HFq4NatW4tSShwcHLLcCuPhw4fy8OHDHKs3UcZ3hoyZu4oWLSo7duzQjv1dICdj\r\nOnfT9jBOTk5SunRp6datm1lQ6Mn3FKL\/VVhYmFSuXFmUUlKoUCEpWrSouLq6iouLiyiltMnNnp6e\r\nZuedOnVKevXqpY0VmMqZApyWlpbi4eGhlWfbpWdx5MgRbWu3Nm3ayLRp06RRo0ZSpEgRbVKHaTxK\r\nRGTLli1axpmePXtm2kqA6EVz6tQpGTZsmLb1a5UqVeTq1at5XS2iHMUAOlE+cu3aNXn\/\/ffl4sWL\r\nUqtWLalQoYLcv38\/y7JJSUmydu1aLYju6uoqjRs3lu3bt8uhQ4dk06ZNMnbsWK2TsXz5cu3cgIAA\r\nbfb64cOHc+v26BWV1T6+Wf0bOHCgnD592mxVg9FolIULF0qjRo3MyhYqVMhsL+Bq1aoxFTGJiPmq\r\nmKVLl5qlrtbr9Vpw\/Gnp3Hft2iVt27bV9kJ\/8p+Dg4M0bdpUgoKCcvvW6BVx584diYqKyrbMvHnz\r\nZMmSJXLy5MlMKxpEzJ+rFy5c+NsgOhERZc+0irdly5YiIk+daGR6\/m7dulWKFi2qZQjJeIwoN8XG\r\nxppNOLa1tZXevXvL77\/\/\/szXWLx4sVk69+3bt0tYWJhZ0JEBSHre4uPjtZTZjRo1ku+\/\/17Cw8Pl\r\nwYMHcu3aNRk+fLiULVtWa5vTpk0zOz80NFT27t0rbdu2lRo1aoizs7MUL15cxo8fL1u3btXKse3S\r\ns0pKSpL58+drQXTTmJOrq6t06tRJfv31VxEx\/77v06eP2ap1vgvQiygpKUm2bt2qjRk4OjpK586d\r\n5datW3ldNaIcZwEiyhcePnyIpk2bIjo6GgkJCTAajShTpgycnJyQlpYGS0tLs\/I2NjYYMmQIihQp\r\ngqFDhyIyMhKRkZEYPHgwLC0tkZSUBKUUAGDKlCkYN26cdm5SUhKSkpIAACKSezdJryRTO1u\/fj1m\r\nz54NAHj77bdRrVo1xMXF4eLFi9i\/fz+2bduG2NhYfPTRR2jZsiX0ej2UUvjkk0\/QrFkz7N27F+vX\r\nr0dqaioePXoEAGjcuDGaN2+OcePGoUyZMnl1i\/QC0el0AIA5c+Zo7W3EiBF44403UL58ecTExMDb\r\n2xtXrlxBSEgIxowZA6UURo4cCQDo2bMnKleujHPnzsHLywtxcXEIDQ2Fo6MjmjRpgm7duqF79+5w\r\ncXHJq1ukl1hISAjKly+Ppk2bYseOHXB1dc1UZuHChZg5cyZcXFxw7NgxKKXQuHFjAI+\/k5VS2nMV\r\nAGrXro3Ro0cDALZu3Qo\/Pz+8+eabOHDgACwsLJCeng4LC3YZiIiyYjAYoNfrYW1tDQC4efMmYmJi\r\n4OjoqD1zMzL9f8uWLWFra4vo6GicP3\/e7BjR85KxDWb8OeN3+44dOxAZGYlGjRrBxsYGAQEB8PPz\r\ng4jAw8MD9erV+9vfM3XqVCil8PHHH+PkyZMoUaIEXF1dtfdd098J0fN07949nDt3DpUrV8aqVatQ\r\nv359rY07Ojpi7dq12LRpEzZv3oyff\/4ZixYtgoODA6ZNmwYAKF26NEqXLo2uXbvi0aNHiI+Ph6Wl\r\nJYoVK6b9DqPRyLZLz8zGxgZjx45F2bJlMWfOHNjZ2aFkyZJ4\/\/330ahRI7i4uMBoNGpjDgkJCYiK\r\nigIAVKxYkX0uemHZ2NigVatWcHNzg9FohLu7O7p37w5nZ+e8rhpRzsvL6D0R5Z7o6GgttbopRVXZ\r\nsmXl0aNHf3tuYGCgDB06VOrUqWO2x1njxo1l0aJFWjmDwSCJiYny0Ucfafunx8fH5+Rt0SvMNPPW\r\naDTKw4cPtdSYixcvNktpGRYWJosWLdLaZufOneXIkSNZzhQPDAyU8+fPi5+fnxw6dEiSkpIkOTk5\r\n1+6JXg4+Pj5aGr\/Fixdnek7Gx8fL+vXrtfSrWa1EF3m8zUVsbKxcuXJFwsPDc6v69IoyGAzy2Wef\r\naW2uQ4cOkpqamqnc0qVLxcXFRSwtLbW9ILds2SIi2a+g4Up0IqJnk5ycLHfv3jXLWrNlyxYpWLCg\r\nKKXkk08+0d4vs1pJZnqm9uzZU3Q6nbz99tu5U3HKV7L67jZtOSAicvPmTRk\/fryIiGzfvl1u374t\r\niYmJ0rVrV1FKib29vfTq1esfrUTPuCd69+7d5ejRo2Z9OqLnITw8XGJjY+Xs2bOilJIxY8ZkyvqR\r\n8Z13586d4ubmpq0I\/uGHH7RjGZ\/jRM9TQkJCpr6a0Wg0exYeOXJEypUrJ46OjrJt2zatDNGLKiYm\r\nRhISEvjspHyFU5uI8okiRYpg6tSpKFCgAObOnQsRwZ07d7B+\/XqMHj0aVlZWWZ5nNBpRvXp1eHt7\r\nIzU1FadOndKu5+Lioq3aNc2iDAwMhL+\/P4DHq3t1Ol2Wqy+IspNxlYJSCtHR0Th37hw6d+6MIUOG\r\noFChQlrZUqVK4eOPP4a9vT3Gjh0LPz8\/7ZhpJbrpetWrV8\/0u4RZEugJZ86cgU6nw+uvv47evXvD\r\nwcFBO2Y0GmFnZ4d33nkHJUuWhE6ng7+\/P8aMGQMR0VbyGo1G2NvbA4DZ+Xwe0r+l0+nw\/vvvIyYm\r\nBitWrMC4cePMsseY2tbEiRNhZ2eHuXPnIiIiAgDg5+eHQYMGQa\/Xm616yCirlejNmzfHiRMnuBqC\r\niOj\/7dmzB\/\/5z3\/w559\/YuDAgRgxYgR0Oh3q1KkDBwcHxMXF4fDhw2jcuDG6du0KCwuLTN\/9FhYW\r\nePDgAa5duwYRga2tbR7eEb2qTN\/dw4cPh62tLZYvX671r0JCQtCyZUuEh4fDyckJM2fO1N4PfHx8\r\nMGDAAOzbtw8\/\/fQTRAQzZsx4ppXoH330EZRSmDx5Mn788UfI420j4ebmBqUU34PpfxYaGopy5cqh\r\nbNmy+PLLL1G4cGHUr18fVlZWZu+4er1ea2\/u7u64e\/cuLl++jPj4eOzfvx\/dunWDpaVllu\/ERM9D\r\nxu\/2jG3T9Cz8888\/MXv2bISEhOCNN95A69atteNEL6rChQvndRWIcl9eRO2JKO\/cvXtXZs6cqc0M\r\nb9eunZw7d+5fXSvjjLPU1FS5cOGCtGrVSpRSUqVKFQkODn5e1aZ8avz48TJ79mz5448\/RCklnp6e\r\n2Zb39vZ+6kp0zuSlv2M0GiUhIUHKlCkjSikZMGDAU8uJPF7Z4+PjI7Vq1dLa3ZdffpmbVaZ8KCYm\r\nRm7evGn2mSlLQsbVNqtWrZJy5cqZZVMwyW7G+IULF2TkyJFamw4JCXnOd0BE9HLy8vISR0dH7fk4\r\na9YsiY6O1o5v377drI+1f\/9+bVXkkxlADh48KK6uruLs7Cz79u0TEb6r0vNnygzn5OQkHh4eIiIS\r\nFRUlpUqV0vYrv3Tpklbe1E4TEhKkW7du2kp0d3d3OX\/+vFYuY1v19fWVvXv3mv1eLy8v7W\/hrbfe\r\nkoCAAK5Wo\/9Zenq6zJkzR3u3LVy4sCilZPny5U89J2Nb7du3ryilpGDBghIUFJQbVSbSmNpiTEyM\r\nHDhwQJo3by5KKSlZsqRcu3Ytj2tHRERPwwA60SssY2chY4f17t27MmvWLK1T26dPH7ly5cq\/\/j23\r\nbt2S9evXS8OGDUUpJa6urv\/T9YhERL799lutjQ4YMECcnZ3F19dXRCTLtMUmDKLT\/8JgMEjNmjVF\r\nr9fLyJEjRSTr9mZqS0lJSTJ8+HCtzSmlxNvbO1frTPnb8OHD5fXXX5eIiAgRyRxEL1u2rOh0OnFx\r\ncTGb4JHdQPZvv\/0m48ePl7\/++ivnKk5E9BLx9PTUvuc\/+OAD7Z30SQsXLtTKtWjRQry8vCQuLk47\r\nnpCQIOfPn5eWLVuKUkpat24tUVFRuXQXlN989913UrVqVbGwsBAnJycZM2aMFjxv1qyZXL58OdM5\r\n2QXRf\/31V7OyGzZsEKWUODg4SGBgoNmxjEH0Vq1ayfHjx3PuRinfCAoKko8\/\/licnJy09tWtWze5\r\nf\/\/+U88xtekDBw6InZ2dWFhYyO7du3OrykSaU6dOybBhw6RChQrawqOrV6\/mdbWIiCgbDKATvcKy\r\n2+v07t27Mnv2bK3T0a9fv38c9E5OTpYzZ85IqVKlRK\/Xi1JKGjZsyNm89Fz4+\/tLjx49zAKTEydO\r\nfKZznwyi+\/v7Z\/v3QJRRhw4dRCkllStXznZQ2xREDw4OFgcHB7G1tdXanZeXV25Vl\/KxgwcPmj3r\r\nsgqir169Whssd3V1lRUrVmjHsguim\/bvJSLK71auXKk9a5csWSL37t3Tjj35fhkTEyPz5s3Tyhcu\r\nXFjq1q0rM2bMkGXLlkn\/\/v2ldu3aopSSUqVKcdUZ5bgdO3ZIjRo1RCml9dmbNWsmN27ceOrk4qyC\r\n6HZ2dtKxY0cJCAiQiIgIWbVq1d\/20ZYtW6aVCQ0NzbF7pPzlxo0bMmnSJC2I7urqKkePHhWR7MfA\r\nAgMDxcHBQZRSsmHDhtyqLpEkJSXJ1q1bxd7eXpRS4ujoKJ07d5Zbt27lddWIiOhvcENDolfMgwcP\r\ncOrUKRw8eBAhISFwdHRE+fLl8e6776Jo0aLaPjzFihXDqFGjAACenp74\/vvvtZ+rVKnyTL\/L2toa\r\n1tbWqFevHgoVKoQ2bdpgypQpKF26dM7cHOUrrVu31vYy27t3LwDg8uXLCA4ORrly5bI917SPr2lP\r\n9EePHmHBggVwc3PL6WrTS0z+f5+8+vXr49ChQ3j48CEOHjyIAQMGaHtGZqSUQnp6OgoXLoxChQrB\r\nyckJ5cqVw48\/\/oiZM2fivffe4x5RlKMaNmyIGTNmYMWKFfDz88PQoUOxceNGuLi4wGAwQK\/X48MP\r\nP4RSCvPmzcPt27exaNEiAI+fjzqd7ql7oltbW+f27RARvXCCgoLwzTffAACmTp2KDz\/8EPb29trx\r\nJ98PChcujMmTJ8PV1RWjRo1CcnIyLly4gIsXL0JEtHNq1qyJH374Aa+99lqu3QvlL6b32t69e+P+\r\n\/fuYMGEC0tLSYGFhgVq1aqFChQoAoL0vZKTX62EwGGBrawsfHx8MHjwYu3fvxsGDB3H8+HFUqlQJ\r\nFy5cAABMnDgRXl5eAJDpnWLChAmwtLSEm5sbxwjoualQoQJGjRoFpRQ2bdqEyMhIjBw5Ej\/\/\/DOc\r\nnZ2f+m5r2gNdKYXy5cvnQc0pv7KxsUGrVq3g5uYGo9EId3d3dO\/eHc7OznldNSIi+htKTL04Inrp\r\nhYWF4d1338Uff\/yBmJgYs2MNGjRAp06dMHbsWDg7O2sd6nv37mHVqlXw9PQEAPTt2\/cfBdEBIDg4\r\nGOnp6XBxcYGdnd1zvSfKn0ztEwCOHz+Ozz\/\/HD\/++CMAYObMmZg9e7Z2PDurV6\/WgunBwcEoU6ZM\r\nzlWaXhlBQUFo0qQJHj58iKZNm2Ljxo2oXLnyU8s\/ePAAVatWRY0aNTB16lSsW7cOnp6eqFWrVi7W\r\nmvKrhw8fYtmyZfDy8kJiYiI6dOiQKYgOAGvWrNGC6C4uLvjkk08wduxYAJkHvImI6DFfX1\/06tUL\r\ntra22Lt3L1q3bv3M5548eRIHDhyAn58f7ty5g5SUFNSrVw9t2rTB4MGDUapUqRysOdFj0dHRaNGi\r\nBa5evQpbW1skJibC0dERo0aNwty5cwFkHUTP+HlSUhI++ugjHDp0CDdv3gQAODo6Yty4cZg1a1a2\r\n1yB6njK2s5s3b2L16tXYvHkz7t27h1q1auE\/\/\/kPXF1dAZi\/3yYmJsLT0xOff\/456tati+3bt3MC\r\nE+W6hw8fwsrKCjY2Nux7ERG9JBhAJ3pFhIWFoXXr1rh58yYqVKiASpUq4fXXX0dsbCy2bNmCmJgY\r\nFC1aFG5ubli+fDlKliypnZtVEH3OnDnZBowA8yAn0fP2ZBB96dKl2L17NwBgwYIF+OSTT57pOuvW\r\nrUPTpk1Rs2bNnKoqvYK++uorTJ48GYmJiWjbti3Wr1+PsmXLAng8GKOUglIKIoI9e\/bA3d0dw4YN\r\nw7p165CYmKhl+yDKDQyiExE9X6Zn5zvvvIMtW7agefPmOHbs2D++joggLS0NDx48QHJyMsqVK8fn\r\nLeWqq1ev4r333oODgwM6duyINWvWICgo6B8H0VNTU3HixAkcPXoURYsWxWuvvYZOnTpley7Rv5WS\r\nkgIAOH\/+PNLT01GmTBk4OTmZZQAB\/htE\/\/bbb3H37l1UqVIFixYtQv369bWsB7dv38auXbswfvx4\r\nAMC8efMwffr03L0hIiIieikxgE70Crh79y569OiB06dPo3Hjxvj8889Ru3ZtODg4AAAiIiLQsmVL\r\n3LhxA3q9Hjt37sRbb71ldo2sgugzZ85EjRo1cv1+KH\/IbgKGaWAx4wDj8ePHsWzZMvj6+gL4Z0F0\r\non8qJiYGn376Kb7++mskJyfDzc0N06ZNQ6NGjeDo6AgASEtLw9WrVzFq1CgcP34cK1aswJgxYzi5\r\niPLEvwmilylTBqNHj8aUKVPyuPZERC+m\/v374\/vvv0ezZs1w\/PhxpKamwsrK6m\/PM6XKzvg+YHqv\r\n5XsC5bQn29iNGzdQoEABuLq6wtfXF9OmTftHQfTsJn1wQgg9b5GRkZg7dy7OnTuH3377DQBQokQJ\r\nlChRQguOFy1aVCv\/5Ep0JycnlCpVCq1bt8bDhw9x7do1nDhxAgAwZcoULF68GADbLhEREf097oFO\r\n9ArYsmULTp8+jRo1amD58uVo1KgRDAaDdnzjxo24ceMGAGDhwoXo3LlzpmuY9kTX6XSYNWsWvv\/+\r\ne3Ts2JEBdMoRGTur9+\/fR2hoKG7cuIHixYujcuXKKFGiBABAp9NpAzktWrTQzvf19dVmjTOITjnB\r\n0dERHh4eSEtLw7fffouAgADcvn0b5cuXR\/\/+\/WFhYYE\/\/vgDx44dw2+\/\/YY6derA3d0dADgoTnmi\r\ncOHCmDhxIgDAy8sLBw8ezHJP9A8++AAAsHjxYgQHB2Pjxo14\/\/33tYkhRET0X6YJydeuXcPt27fN\r\nsnhlxRS4PH\/+PG7cuIF+\/fppAUnTuy\/fEyinmPpYT7axihUrIi0tDQDQs2dPANCC6KtWrQIAzJ07\r\nV9v7\/Mkguul6aWlpsLS0NDvGACQ9T6GhoejSpQsCAwNhaWkJBwcHWFtbIy0tDX\/88QcGDBiAkSNH\r\nYuDAgahevToA8z3Rv\/nmG9y\/fx\/R0dEICgpCsWLFEB4ejk6dOqFbt24YOXIkAGZNICIiomfDADrR\r\nK8Df3x8A8NZbb6FmzZoQEa0zMGPGDCxYsAAAsHTpUowePTpTp9ekWLFi+PDDDxEbG4uEhAQMHTo0\r\nd26A8pWMndUNGzbA19cXhw8fRkpKCgoUKABHR0d4enrCzc0NlSpVMhvIYRCdclOJEiUwb948lC1b\r\nFosWLcKNGzdw48YNHDlyBBkT+JQsWRLff\/+9tt8eUV75J0H0pKQkrF+\/Hjt27GDwnIjoCaZAeL16\r\n9aDT6ZCamop9+\/Zh2LBhsLB4+jCKUgpRUVEYPXo07t+\/jwoVKqBJkya5WHPKD9LT0zO1Q9N3\/IMH\r\nD3Dq1ClcvHgR9vb2qF69Otzc3GBpaakFwJ8Moq9cuRJA1kH0DRs2YP\/+\/di2bdszZV8g+rdu376N\r\nDh06ICgoCPXr18fIkSPRunVr6PV6REVFYebMmTh06BAWLlyIqKgoLFq0CE5OTgCA8uXLY+TIkRAR\r\nbNy4EQ8ePEDhwoVx+PBhlCpVCkajUdtii8FzIiIiemZCRC+1q1evSpEiRaRAgQJy5swZs2MzZswQ\r\npZQopeSLL76Q1NRUs+MpKSkSHR2d6Zrx8fHaz2lpaTlTccqXDAaD9vOcOXNEKSU6nU6UUlKqVClx\r\ndXUVpZQ4ODjI4MGD5dixY1r59PR07edjx46Ju7u71r4XLlyYq\/dB+YvBYJBz585J165dpXbt2lq7\r\nq1OnjgwcOFBu3LiR11UkMhMTEyOffvqp2NnZiVJKOnbsKBERESJi\/iyNiYnJoxoSEb0cgoODpWjR\r\noqKUkqZNm8qVK1eyLW8wGGTnzp1SpEgRqVatmoSEhORSTSk\/2LZtm\/Zzxn666bs9JCREWrRoobVZ\r\npZQ4OztLu3btJCwsLNP1du3aJVWqVBGllBQpUkQ8PDy0Y0ajUTZu3KhdZ+PGjTl3Y5TvxcXFycCB\r\nA0UpJa+\/\/rr8\/vvvZu+sIiLTp083G9968riIyM2bN2Xy5Mna30DdunXlwYMHIvL4b8ZoNObK\/RAR\r\nEdGrgQF0opfczZs3xcnJSVxcXOSvv\/7SPs8ueG7qaJw9e1bGjx+fZWdaRNi5oOcqY3uaO3eu1j5H\r\njBghmzdvljt37khQUJDWcba2tpZOnTrJkSNHtPOyC6LPnDkzV++H8p+EhARJSUmRixcvyu+\/\/y5J\r\nSUmSkJCQ19UiylJWQfTIyEgRkSwHHImIKGtff\/219ixt166d3Lp1SztmMBjM3nEvX74sTZo0EaWU\r\njB49WhITE\/OgxvQq8vT0FKWUdO\/eXfssY0AwLCxMKlWqJEopsbe3F0dHR1FKiZWVlSilpEaNGnLk\r\nyJFMk+p37dolVatWFZ1OJ9bW1vLuu+\/K\/v37td+nlJKJEyfm5q1SPnTp0iV57bXXpHjx4uLr6ytG\r\no9Fs8v20adO09rh06VJJSUl56rVu3rwpU6ZMkeLFi4tSSmrXrq1NGuUCESIiIvonGEAnesnduHFD\r\nChcuLEop2bVrl4hkHzzPOMBj6oT069ePg+mUazZt2mS2cvz27dtmx\/ft26cNUlpZWUn79u2zDaL3\r\n7dtXW8l+\/\/79XLsPyn+ymlTEiUb0InsyiN6kSRO5c+dOXleLiOilEhMTI2PHjhVbW1tRSombm5vs\r\n2bNH7t69a1bm8OHD4ubmJkopqV+\/voSGhuZhrelV8ujRI+nVq5cWDHd3d9eOpaenS1xcnPTu3VuU\r\nUtK4cWPx8fGR69evyy+\/\/CKTJk3SsnxVrVpVDhw4kCmIvnv3bmnQoIFYW1tr2cBM\/bXJkyeb\/S6i\r\nnLB48WJRSkmjRo0kKirK7NjfZVY09ccyBscZRCciIqLngXugE73kKlSogM6dO2P79u3w8\/PDwYMH\r\nsWbNGgCP9zwfNWqU2Z7nSikAwJkzZ7B3717odDp06NCBe0BRrrhy5QrWrVsHAPDw8MDYsWNhZ2cH\r\n4PFek3v27MGIESOQmJiIsmXLIiQkBAEBAVq7bdOmTaY90dPS0mBtbY3Jkydre6AR5QRTO\/y7z4he\r\nFKY90fV6PWbPno0zZ84gJSUlr6tFRPRSKVy4MDw8PJCeno7Nmzfj2LFjCAkJgaOjI9q3bw9LS0sE\r\nBAQgPDwcISEhKFmyJHx8fFC6dOm8rjq9IhwcHLBixQo4Ojriu+++g6+vL3r16oWdO3dCr9fjzp07\r\nOHXqFKpWrYpVq1ahXr16UEqhYsWKqFmzJho2bIhPPvkEV69excSJE7Fs2TK0a9dOGyfo3r07ChYs\r\niK1bt+L7779HXFwcatWqhcGDB2PKlCkAuG80PX\/p6emwsHg8LB0TEwMAaNeuHZydnbUyM2fOxPz5\r\n8wEAy5YtMxvfMp2\/fft2tGzZEi4uLtpnpj3RAWDz5s24dOkSWrZsiYCAABQqVIjtmYiIiJ4JA+hE\r\nLymj0QidTgcAqFu3Lnx8fLBp0yakpqYCAJYvX46RI0dqnQIR0QI9jx49wq5duxAYGIimTZuicePG\r\neXMTlO+cPn0aJ0+eRPv27TFgwAAteA4ABw4cwPDhwxEdHY3u3bvD19cXQ4cOxaZNmxAQEAARAZA5\r\niN66dWs0adIEBQoUyKvbIiJ6YRUuXBhjx46FlZUVevTogTJlyuR1lYiIXjrFixfH3LlzUbFiRcyd\r\nOxehoaEIDQ3FhQsXtDKFChVCkyZNsGnTJlSqVCkPa0uvIldXV8yZMwcGgwE+Pj7w9fWFu7s7du3a\r\nhVu3biEiIgLDhw9HzZo1oZTS+v9OTk7o2bMnrK2tMXHiRAQFBWUZRG\/dujUaNGiAyZMnIzo6GsWL\r\nF0fFihUBMHhOz19wcDDWrVuHPn36oG7dunjw4AEA4M8\/\/9TKZBc8NxqNWvB97dq1mDx5Ms6ePQtX\r\nV1ft\/KyC6LVq1cLly5dRsGDBXLlPIiIierkxgE70EoiLi0NMTAxu374NOzs71K5dWwueA8DUqVPh\r\n7++PgwcPQqfT4c0330SnTp20DkXGmb1JSUn49ttvsWTJEgDAkCFDUKNGjdy\/KXrlmQZaTIM3IoLA\r\nwECICDp27Ijq1atrZU+fPo2hQ4ciOjoaXbp0wa5duwAAK1euRFBQEE6dOoWjR48+NYjO4DkR0dM5\r\nOjpi6tSpZu8ORET0zzg5OWHSpEno0KEDvL29cf36dVy9elXrn3Xr1g0dOnRAiRIl8rqq9IpycXHR\r\nAoo+Pj7YvXs3Bg0ahPfffx\/29vZ44403YGVlBcA8S5K1tTXefPNNAMg2iG5vb48qVaqY\/U6j0cjg\r\nOT1Xt2\/fRsuWLREWFgalFMqVK4dWrVphw4YNiI6OxqNHj\/DZZ59hwYIFADIHz0VEe6fdtm0bfvnl\r\nFwDAvXv3zALowH+D6Hq9Hl5eXggPD8e9e\/cYQCciIqJnwgA60QsuLCwM7733Hm7cuIHg4GDo9Xp0\r\n7doV\/fr1w5tvvqm9+C9atAgPHjzAr7\/+Cn9\/f3z22Wd466230K1bNy14fvbsWRw4cABz5swBAEyb\r\nNg0jRowAYL5Cneh\/lXGVQlBQEKpUqQKlFDw9PVGhQgW88847WtnQ0FD06dMH9+\/fR\/v27bF7924o\r\npZCUlARbW1t0794dp0+fhsFgwNGjR2FhYYG0tDR07NiRgzlERM+IwXMiouejVq1a8Pb2hqWlJaKj\r\no2FpaclgDOWaJ4Po27Ztw9GjR5GUlGQWYHyyb\/8sQfSs3hX4\/kDPU1xcHMaNG4ewsDDUqlULtWrV\r\ngpWVFSpVqgQRwfHjx9GpUyecPn0aAODl5YWRI0dmuS1haGgo9u7dC6UURowYgZo1a2bZ9suXL49h\r\nw4bB0tISgwYN0jIrEBEREf0dJablfET0wgkPD0ebNm1w\/fp1WFtbIyUlBTqdDkajEa+99ho6dOiA\r\n2bNno2jRokhJScHJkycxY8YMnDp1Sguad+7cGRYWFtDpdDh79izCwsIAAJMmTdJWoTMlGz1PGTut\r\nH3\/8MZYsWQJfX190794dAJCWlgZLS0sYDAakp6fjo48+wurVq1G\/fn1s374dFStWNGuThw4dQseO\r\nHVG2bFmEhYXBaDSiR48e2LJlC2xtbfPsPomIiIgofzK97xqNRiilzFJmE+WGyMhIeHh4YNu2bUhJ\r\nSYFSCgsWLMDUqVPNVug+KSUlBQcOHMDEiRMRGhqKatWq4fPPP0fbtm211etEOSUwMBDt2rVDkSJF\r\n8N1336FWrVpav3\/27NnaYg8AWLFiBT744ANYWlpCRMzadUpKCry9vTFlyhQUK1YM69evR7du3bL9\r\n3RkzMxIRERE9C04lJXpBxcfHY\/z48bh+\/ToaNGiAhQsXYtOmTfDy8oKdnR2uX7+OTZs2Yfz48bh7\r\n9y6sra3RrFkzrF27Fl26dEF6ejrS09Oxd+9e+Pr6YufOnQgLC0PVqlXx2WefMXhOOcY0cLhy5Uqt\r\nnW3atAlRUVEAoM0e1+v10Ol0OH\/+PACgbdu2KFWqFERES\/1uup6VlRVmz56Nt99+G9bW1pg3bx6D\r\n50RERESUJ0zvuzqdTvuZwXPKTS4uLpg3bx769esHKysriAj27t2L2NhY6HQ6pKenZ3meaSX6smXL\r\nUL58efz1118YPHgwrl+\/nst3QPnJ3bt3AQBXr15FVFQU+vTpgxo1apj1+3v27ImOHTtq54SEhODO\r\nnTswGAxQSmnB8zt37mDNmjWYMmUKAGDChAl\/GzwHwOA5ERER\/WN8eyB6QUVFReHUqVOoUaMG1q9f\r\njzp16mjHmjdvjnHjxuHs2bPYtWsXjEYjli9fDmdnZ9SoUQN79+7F119\/jcDAQJw8eRKWlpawtbVF\r\n3759UatWLTRq1AgAg+eUc27duoU1a9YAeJx2zd3dHcWLFzcrIyK4dOkSzpw5AwCoXbs2rK2tteNK\r\nKaSmpuLnn39Gamoq9Ho9Nm7ciPnz52fa24yIiIiIiCg\/cXV1xYIFC6CUwvbt23Hy5EkMHToUvr6+\r\nsLCweOqK24zp3AcOHIj27dujevXquV19yieCg4NRoUIFdOrUCcOHD4eNjQ1atGihTaw3TT6qU6cO\r\nhg8fjsTERBw7dgxeXl4IDAxE7dq1MWDAACilcOLECRw\/fhzbtm0DAHz00UeYNm0aAMBoNHLLASIi\r\nInquGEAnekGdPXsWd+7cwaRJk1CjRg0A0NJWNWzYEF999RXGjRuH48ePY\/fu3QAep7gqVqwYAGDY\r\nsGEAHu8xZWdnh5SUFBQoUEC7vtFoZPCcnpsnJ2NERUXh8uXLePfdd\/Huu+\/C0dERgHl6d6UUnJ2d\r\nUbZsWURGRuLPP\/9EfHw87O3ttbJ\/\/fUX9u3bh6JFi2p\/BwyeExERERERmQfRfXx8sGfPHvTq1Qs7\r\nd+782yB6586dcebMGdSuXRsAA5D0\/BkMBixfvhwA4Ofnh\/PnzyM5OVkbEzCND5j+6+7uDgBwdHTE\r\njz\/+CD8\/P\/j5+WH16tXQ6XSIjY2FXq+HXq\/HtGnTtJTvXBxCREREOYFvxkQvKNNK3DZt2mgdXlPa\r\nKhFB7dq1sWLFCrRo0QJpaWnYvXs3xo0bh3v37gF43IEAAHt7e+h0OtjY2Jhdnx1jep5MnVUvLy8s\r\nW7YMQUFBAIAWLVpowXMgc2pLZ2dnlCtXDqmpqdi6dSv27NmDiIgIJCQk4KeffsL48eNx6dIlNGzY\r\nEOXKlcu1+yEiIiIiInoZuLi4YP78+ejfvz9sbGzg6+uLXr16AYAWRM+KjY2NFjw3GAwcI6DnTq\/X\r\nY9KkSRg2bBisrKy0VO6HDh1CWlqa2eR6Uyp3d3d3LFq0CPPnz4eTkxMcHBwQFxeH+Ph4WFpaYvDg\r\nwdiwYQOD50RERJTjlJjeUIgoT8XHxyMmJgYREREoVKgQkpOTUb9+fZw8eRJNmjTJVN40Q\/fixYva\r\nSnRLS0v06NFDW4nOGeSUm2bMmIEFCxagXr16KF68OPz8\/HDmzBm8\/vrrZivPTUzt888\/\/4S7uzuC\r\ngoLg5OSEYsWKQSmFmJgY3LlzB6VLl4a\/vz8qVqyYR3dGRERERET0YouIiMCMGTPg4+OD5ORk9OzZ\r\nEzt37gSAp65EJ8oNERERmD59Onx8fJCamooGDRpg165dKF26tFkA\/MlxgytXriA2NhYXL15EiRIl\r\nUKZMGdSoUUNryxzzIiIiopzEADrRCyA8PBwjRozAlStXEBwcDACoX78+zp8\/j6+\/\/hpDhw7NssP7\r\ntCC6u7s7vvjiCxQrVizLwCVRTvD29sZHH32E9PR0FCtWDNHR0fj2228xYMCAbAdsjEYjjhw5gjFj\r\nxuDatWva59bW1ihfvjx8fX1RpUqV3LoNIiIiIiKil1JkZCQ8PDwYRKcXTkREBDw8PLB9+3YkJyej\r\na9eu+PHHHwFkbpvZjWM9mfadiIiIKKcwgE6Ux8LDw9G2bVtcu3YNlpaWSEtLMzteu3ZtnDhxAnZ2\r\ndlmmpnoyiH769GkAQOvWrbFjxw5tP2mi3LBhwwaMGTMGycnJAIDOnTtj\/\/79AP5+dnhUVBQWLlyI\r\nu3fvIi0tDS1atIC7uztKly6dK3UnIiIiIiJ62T0ZRO\/Vqxd27NgBgCt2KW9xggcRERG9TBhAJ8pD\r\ncXFxGDx4MPbu3YsGDRrg7bffRqlSpRAcHIzPPvsMjx49QnJyMt5880388MMPsLGxyTaIfunSJYwd\r\nOxYBAQEYP348li1blkd3RvlNxoGY9evXY+LEiUhISIBSCrNnz8bMmTMzlXva+URERERERPTvmdK5\r\n\/\/DDD4iPj0erVq3g7++f19UiYhCdiIiIXhoMoBPlocuXL6NNmzYoXrw4tmzZgjp16mjHjh49iiVL\r\nluCXX35BYmIievToga1bt\/5tEP38+fM4duwYxo8fD4CBSXq+skuXlpaWBktLSwCPg+jjx49HUlIS\r\nKleujHHjxmHUqFEAsm+TGa\/LlGxERERERET\/jilQ+c0336B\/\/\/7YunVrXleJCMB\/J3gwiE5EREQv\r\nMgbQifJAVFQUihcvjn379uGtt97CZ599hgkTJsDCwsIsuPjrr79i\/vz5OHTo0D8KoptkVYboWWTV\r\ndjJ+FhUVhXv37iEqKgp2dnaoVq0aChUqZFb+66+\/xpgxY5CSkoIaNWpg1KhRGDlyJABO7CAiIiIi\r\nIspp4eHhOHr0KAYNGgSA\/TB6cXAlOhEREb3o+NZMlMuCg4Ph4uKCLl26wNLSEgULFkTTpk21zkHG\r\nzmzDhg3h4eGB9u3bw9bWFrt378bAgQORnJwMvV4Pg8Fgdu0nV+syeE7\/1N27dwE8bjvp6ena5xmD\r\n5ytXrsTAgQPRpEkTtG\/fHu3bt0fjxo0xffp0nDlzRjtn2LBh8Pb2hrW1NQIDA7Fq1SqsXr0awON2\r\nbjQac\/HOiIiIiIiI8pdSpUppwXODwcDgOb0wXFxcMH\/+fPTv3x82Njbw9fVFnz59AEBbXEJERESU\r\nl7gCnSgXGQwGTJ48GcuXLwfwuMNw7949HDt2DI0bN37qef90JTrRvxEcHIwKFSqgTZs2OHz4MIDH\r\nM7\/1er02OWPu3LmYNWuWlsZdr9dDp9MhLS0NBQoUgJ2dHVatWoXevXtr1+VKdCIiIiIiIiJ6kimd\r\n+w8\/\/ID4+Hi0atUK\/v7+eV0tIiIiIq5AJ8pNer0ekyZNwrBhw2BtbY3IyEgYjUacOHECAJ46wzar\r\nleiDBw\/WVqJzHgz9rwwGgzaxw9\/fH7169QJgPvN7\/fr1mDVrFoDHq8tXrFiB3bt3Y8WKFWjYsCFE\r\nBPfv30ffvn2xbt067dpciU5ERERERERET3J1dcX8+fO1SfglSpTI4xoRERERPcYV6ER5ICIiAtOn\r\nT4ePjw9SU1PRvHlz7Nu3D4UKFcp2ryfTSnR\/f3\/ExcXBzc0Nhw8f5t5Q9FyEh4fD09MT3333XaY9\r\nyB4+fIi+ffvi8OHDWLx4MYYPH47ChQtr58bHx2PJkiXYs2cPLl68CADYsmULBg4cqJXZsGEDRo8e\r\njZSUFNSpUwfvvPMOJk6cmKv3SEREREREREQvlvDwcBw9elTbcoDZ6oiIiCivMYBOlEciIiLg4eGB\r\n7du3Izk5Gd27d4evry8AZBtE\/+233zBv3jzs2bMH77\/\/PtauXZub1aZXnCl9mo+Pj1kQPTo6GiVK\r\nlECLFi2wZcsWlCxZUjvHtI1AcnIyNm\/ejK+++gp\/\/PEH9Ho9Dh06hFatWmllN2zYgAkTJiA+Ph5N\r\nmjTB\/v374ejomAd3SkREREREREQvGm5VSERERC8CTuUjyiOurq5YsGAB+vfvDxsbG+zZs8csbXZ6\r\nenqW5zVo0ABTp07F2rVrteA5U2DT8+Lq6op58+Zp7dLX1xd9+\/ZFamoqbG1tUaVKFbPgOQBtGwEb\r\nGxsMGTIEAwcORPHixWEwGLBy5Uo8fPgQBoMBAPDee+9h0aJFcHZ2xrp16xg8JyIiIiIiIiINg+dE\r\nRET0IuAKdKI8FhkZCQ8Pj0wrfoHsV6KbcGYu5YQn22WdOnUQHByMyZMnw8PDI8u2KSJQSiExMRG9\r\ne\/eGn58fSpQogWPHjqFixYpmbTU2NhaFChXKi1sjIiIiIiIiIiIiIiJ6Kq5AJ8pjLi4umVb8PstK\r\ndBMGzyknuLi4YP78+ejfvz+sra1x4cIFxMbG4qeffkJsbGyWEzuUUjAYDLC1tYWnpycKFiyIO3fu\r\nYP\/+\/QAAnU6nZUtg8JyIiIiIiIiIiIiIiF5EDKATvQBcXV21YOW\/CaIT5QTT5I5+\/frBysoKABAe\r\nHo5Lly4ByHrrAFM696JFi0IpBQBISkoC8DjArtPxa4eIiIiIiIiIiIiIiF5cjGQQvSAyrvg1BdH7\r\n9OkD4HEQnfucU15wdXXFwoULtZXowcHBmDt3LlJTU6HT6bS9zTNSSsHKykrLjpBVGSIiIiIiIiIi\r\nIiIiohcRA+hEL5CM6dzt7e2xc+dOtGnTBgC4cpfyjIuLCxYuXIgBAwbAxsYGhw4dQr9+\/QD8dwsB\r\nEYGIAHi8Mj0gIADJyclwdnZGs2bNtDJEREREREREREREREQvMkbkiF4wpnTuvXv3BgCUKFEij2tE\r\nZD65w8bGBnv27EGXLl1w9epVJCUlQSml7YH+119\/YfXq1UhMTMRrr72GmjVrAoCW0p2IiIiIiIiI\r\niIiIiOhFpYRLAoleSOHh4Th69CgGDRoE4PGqXq5Cp7wWGRkJDw8P+Pj4IDk5GbVr10bjxo3RrVs3\r\n6PV6\/Pbbb\/D19cXvv\/+OkiVLwt\/fH5UqVcrrahMRERERERERERERET0TBtCJXgIGg0FLlU2U10xB\r\n9G3btiElJUX73NbWFomJiShcuDDq16+Pr776Cq+99loe1pSIiIiIiIiIiIiIiOifYQCdiIj+scjI\r\nSEyfPh3btm1DamoqnJ2dsWrVKqSmpqJixYqoWLEiihQpktfVJCIiIiIiIiIiIiIi+kcYQCcion8l\r\nIiIC06dPh4+PD1JTU\/Hmm29i3759eV0tIiIiIiIiIiIiIiKif40BdCIi+tciIyPx6aef4uuvvwYA\r\nhISEoHTp0nlcKyIiIiIiIiIiIiIion+HAXQiIvqfhIeHY\/HixRg9ejSqVq2a19UhIiIiIiIiIiIi\r\nIiL61xhAJyKi\/1l6ejosLCzyuhpERERERERERERERET\/EwbQiYiIiIiIiIiIiIiIiIiIAOjyugJE\r\nREREREREREREREREREQvAgbQiYiIiIiIiIiIiIiIiIiIwAA6ERERERERERERERERERERAAbQiYiI\r\niIiIiIiIiIiIiIiIADCATkREREREREREREREREREBIABdCIiIiIiIiIiIiIiIiIiIgAMoBMRERER\r\nEREREREREREREQFgAJ2IiIiIiIiIiIiIiIiIiAgAA+hEREREREREREREREREREQAGEAnIiIiIiIi\r\nIiIiIiIiIiICwAA6ERERERERERERERERERERAAbQiYiIiIiIiIiIiIiIiIiIADCATkRERERERERE\r\nREREREREBIABdCIiIiIiIiIiIiIiIiIiIgAMoBMREREREREREREREREREQFgAJ2IiIiIiIiIiIiI\r\niIiIiAgAA+hEREREREREREREREREREQAGEAnIiIiIiIiIiIiIiIiIiICwAA6ERERERERERERERER\r\nERERAAbQiYiIiIiIiIiIiIiIiIiIADCATkREREREREREREREREREBIABdCIiIiIiIiIiIiIiIiIi\r\nIgAMoBMREREREREREREREREREQFgAJ2IiIiIiIiIiIiIiIiIiAgAA+hEREREREREREREREREREQA\r\nGEAnIiIiIiIiIiIiIiIiIiICwAA6ERERERERERERERERERERAAbQiYiIiIiIiIiIiIiIiIiIADCA\r\nTkREREREREREREREREREBIABdCIiIiIiIiIiIiIiIiIiIgAMoBMREREREREREREREREREQFgAJ2I\r\niIiIiIiIiIiIiIiIiAgA8H+EWWb3V6\/A9QAAAABJRU5ErkJggg=='
      // };
      console.log('responseObject.body', responseObject);
      const fileInformation = responseObject.body;
      field.fileContents = fileInformation.fileContents;
    } else {
      throw new Error('Invalid field parameter');
    }
    // this.saveFile(fileInformation);
  }


  ngOnInit(): void {
    this.sidenavService.subject.subscribe((value: any) => {
      this.sideContent = value.componentName;
      this.sidenav.mode = value.mode;
      this.sidenav.position = value.position;
      if (value.eventName === 'open') {
        this.openSideNav();
      } else {
        this.closeSideNav();
      }
    });
  }

  private openSideNav() {
    this.sidenav.open();
    document.body.classList.add('NoScroll');
    document.documentElement.classList.add('NoScroll');
  }

  private closeSideNav() {
    this.sidenav.close();
  }

  onClose() {
    document.body.classList.remove('NoScroll');
    document.documentElement.classList.remove('NoScroll');
  }


  setFormData(form: Form) {
    if (form?.sections?.length > 0) {
      this.form = form;
      this.sections = form.sections;
      setTimeout(() => {
        this.profileRequestorService.setForm(form);
      }, 0);
      this.creationDate = moment(form.header.creationDate).locale('en-US').format('DD/MM/YYYY HH:mm:ss');
      /* istanbul ignore next  */
      if (form?.commentsDrop) {
        this.numberOfComments = this.form.commentsDrop.length;
      }
      // form.lovs && form.lovs.decision &&
      if (form?.lovs?.decision?.type === 'buttons') {
        form.lovs.decision.options.forEach((option: any) => {
          this.isSubmitting[option.value] = false;
        });
      } else {
        this.isSubmitting['SUBMIT'] = false;
      }
      this.isValidLoad = true;
      if (form?.header?.status?.key !== 'NEW') {
        this.hrRequestIsSubmitted = true;
      }
    }
  }

  errorResponse(form: any) {
    if (!this.form) {
      this.form = new Form(
        Constants.NO_VALUE,
        Constants.NO_VALUE,
        Constants.NO_VALUE,
        Constants.NO_VALUE,
        Constants.NO_VALUE,
        Constants.NO_VALUE,
        form
      );
    } else {
      this.form.messages = form;
      this.form = loadFormHooks.afterTranspilePayload(this.form);
    }
    window.scrollTo(0, 0);
  }

  onSubmit(form: any) {
    if (form.form.error) {
      this.profileRequestorService.disableButtons = false;
      this.profileRequestorService.isSubmitting[form.action] = false;
      this.errorResponse(form.form);
    } else {
      if (form.action == 'saveRequestDetails') {
        window.location.reload();
      } else {
        this.Congratulation(form.form);
      }
    }
  }

  Congratulation(data): void {
    const dialogRef = this.dialog.open(SubmitDialogComponent, {
      data: data,
      panelClass: ['main-popup', 'confirm-dialog'],
      scrollStrategy: new NoopScrollStrategy()
    });
    dialogRef.afterClosed().subscribe(() => {
      window.location.reload();
    });
  }

  onHrSubmit(form: any) {
    if (form instanceof Form) {
      if (form?.sections?.length > 0) {
        this.form = form;
        this.sections = form.sections;
        this.creationDate = moment(form.header.creationDate).locale('en-US').format('DD/MM/YYYY HH:mm:ss');
        if (form.commentsDrop) {
          this.numberOfComments = this.form.commentsDrop.length;
        }
        if (form?.lovs?.decision?.type === 'buttons') {
          form.lovs.decision.options.forEach((option: any) => {
            this.isSubmitting[option.value] = false;
          });
        } else {
          this.isSubmitting['SUBMIT'] = false;
        }
        this.isValidLoad = true;
      }
      this.isReady = true;
      this.hrRequestIsSubmitted = true;
    } else if (form instanceof Messages) {
      this.errorResponse(form);
    }
  }

  isReadOnly(index: number): boolean {
    return this.sections.length - index !== 1;
  }

  isOnBehalfOfAuthorized() {
    return this.form.profileInfoDrop.onBehalfAuthorized;
  }

  changeFeedbackStatus(event: any) {
    const self = this;
    setTimeout(function() { self.feedBackIcon = event; }, 100);
  }

  viewForm(): void {
    this.form.sections[0].header.readOnly = !this.form.sections[0].header.readOnly;
    this.form.sections[0].body.details['isEditable'] == 'true' ? this.form.sections[0].body.details['isEditable'] = 'false' : this.form.sections[0].body.details['isEditable'] = 'true';

  }

  // New
  files: Array<{
    name: string;
    size: string;
    description?: string;
    comment?: string;
  }> = [
    { name: 'Document1.pdf', size: '1.2 MB', description: '', comment: '' },
    { name: 'Image1.png', size: '500 KB', description: '', comment: '' },
    { name: 'Presentation.pptx', size: '3.4 MB', description: '', comment: '' }
  ];
  displayedColumns: string[] = ['fileName', 'description', 'comment', 'actions'];

  isOpen = true;
  isButtonOpen = false;

  toggleTabContent(): void {
    this.isOpen = !this.isOpen;
    this.isButtonOpen = !this.isButtonOpen;
  }

}
