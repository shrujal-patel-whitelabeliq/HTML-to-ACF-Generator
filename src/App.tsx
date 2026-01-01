import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Generator from './pages/Generator';
import HtmlToAcf from './pages/HtmlToAcf';
import PhpToAcf from './pages/PhpToAcf';
import AcfToPhp from './pages/AcfToPhp';
import Settings from './pages/Settings';
import Diagnostics from './pages/Diagnostics';
[
  {
    "key": "group_brand_page",
    "title": "Brand Page",
    "fields": [
      {
        "key": "field_brand_page_description",
        "label": "Page Description",
        "name": "brand_page_description",
        "type": "textarea"
      },
      {
        "key": "field_brand_tabs",
        "label": "Brand Tabs",
        "name": "brand_tabs",
        "type": "repeater",
        "layout": "row",
        "collapsed": "field_tab_title",
        "sub_fields": [
          {
            "key": "field_tab_title",
            "label": "Tab Title",
            "name": "tab_title",
            "type": "text"
          },
          {
            "key": "field_tab_subheading",
            "label": "Tab Subheading (Grey Box Heading)",
            "name": "tab_subheading",
            "type": "text"
          },
          {
            "key": "field_tab_description",
            "label": "Tab Description (Grey Box Paragraph)",
            "name": "tab_description",
            "type": "textarea"
          },
          {
            "key": "field_tab_image",
            "label": "Tab Image (Bulb Image)",
            "name": "tab_image",
            "type": "image",
            "return_format": "array",
            "preview_size": "medium",
            "library": "all"
          },
          {
            "key": "field_service_title",
            "label": "Service Title",
            "name": "service_title",
            "type": "text"
          },
          {
            "key": "field_service_list",
            "label": "Service List",
            "name": "service_list",
            "type": "repeater",
            "layout": "table",
            "button_label": "Add Service",
            "sub_fields": [
              {
                "key": "field_service_item",
                "label": "Service Item",
                "name": "service_item",
                "type": "text"
              }
            ]
          }
        ]
      }
    ],
    "location": [
      [
        {
          "param": "page_template",
          "operator": "==",
          "value": "page-brand.php"
        }
      ]
    ],
    "position": "normal",
    "style": "default",
    "label_placement": "top",
    "instruction_placement": "label",
    "hide_on_screen": ""
  }
]
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Generator />} />
          <Route path="html-to-acf" element={<HtmlToAcf />} />
          <Route path="php-to-acf" element={<PhpToAcf />} />
          <Route path="acf-to-php" element={<AcfToPhp />} />
          <Route path="diagnostics" element={<Diagnostics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
