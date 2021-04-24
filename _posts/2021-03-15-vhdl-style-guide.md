---
layout: post
title: VHDL Style Guide (VSG)
tags:
    - VHDL
    - Tools
---
VHDL Style Guide describes it self as a tool that "provides coding style guide enforcement for VHDL code". It is similar to [clang-tidy](https://clang.llvm.org/extra/clang-tidy/) or [Black](https://black.readthedocs.io/en/stable/) in that it can fix your code to follow a coding styleguide. This post is a quick overview of VSG to help you get started using it.

{% include toc.html %}

{% assign listing_num = 1 %}

The docs are [here](https://vhdl-style-guide.readthedocs.io/en/latest) and the repository is [here](https://github.com/jeremiah-c-leary/vhdl-style-guide). Install with: `pip install vsg`

## Example

To showcase the basic features of VSG we will be running it on the half adder posted on [nandland](https://www.nandland.com/vhdl/modules/module-half-adder.html), but with some mistakes injected to make this a bit more interesting. The code looks like this:

{%
  include vhdl_code_snippet.html
  listing_num=listing_num
  description="Original Half Adder design"
  dir="includes/vhdl-style-guide/"
  file="half_adder_original.vhd"
%}
{% assign listing_num = listing_num | plus: 1 %}

The command to run VSG on the file is: `vsg -f half_adder_original.vhd`, which gives the output:

{%
  include code_snippet.html
  listing_num=listing_num
  description="Output after running VSG on the original half adder design"
  dir="includes/vhdl-style-guide/"
  file="half_adder_original.txt"
%}
{% assign listing_num = listing_num | plus: 1 %}

Four errors and three different rules that have been broken; the first two errors are due to ports being initialized, the third and fourth error are due to a missing keyword along with the end keyword (entity and architecture respectively).

Now we want VSG to fix all these errors it caught, but first I've copied the original file and renamed it `half_adder_fixed.vhd` so I can look at the changes, VSG also has the `-b/--backup` option for this purpose, but I don't like how it works (copying the file to another file with a `.bak` appended to the filename and overwriting the original).

To have VSG fix the file, we run: `vsg --fix -f half_adder_fixed.vhd` and get the output:

{%
  include code_snippet.html
  listing_num=listing_num
  description="Output after running VSG on the fixed half adder design"
  dir="includes/vhdl-style-guide/"
  file="half_adder_fixed.txt"
%}
{% assign listing_num = listing_num | plus: 1 %}

The `port_012` rule is set to not be [fixable by default](https://vhdl-style-guide.readthedocs.io/en/latest/port_rules.html#port-012), it can be fixed by hand or for a little extra work you should be able to make VSG fix it by following these steps:

 1. Run: `vsg -rc port_012 > config.json`

 2. Edit the json file to have, at least, `"fixable": true` for the `port_012` rule, like shown in [Listing {{ listing_num }}](#config-json) below

 3. Run: `vsg --fix -c config.json -f half_adder_fixed.vhd`


{%
  include json_code_snippet.html
  listing_num=listing_num
  description="VSG config"
  dir="includes/vhdl-style-guide/"
  file="config.json"
%}
{% assign listing_num = listing_num | plus: 1 %}

Now VSG has fixed all our errors.

{%
  include code_snippet.html
  listing_num=listing_num
  description="Output after running VSG with a configuration"
  dir="includes/vhdl-style-guide/"
  file="half_adder_config.txt"
%}
{% assign listing_num = listing_num | plus: 1 %}

## Continuous Integration

In case you want to use VSG in CI, there is an option (-j file.xml) to output JUnit xml files.

{%
  include code_snippet.html
  listing_num=listing_num
  description="XUnit/JUnit results file"
  dir="includes/vhdl-style-guide/"
  file="results.xml"
%}
{% assign listing_num = listing_num | plus: 1 %}

Adding vsg to GitLab CI is straightforward:

```yaml
image: ghdl/vunit:gcc
vsg:
  stage: test
  before_script:
    - pip3 install vsg
  script:
    - vsg -f half_adder.vhd -j vsg_results.xml
  artifacts:
    reports:
      junit: vsg_results.xml
```

With this GitLab presents an overview of errors:

{%
  include image.html
  dir="/assets/img/"
  file="vsg_ci_gitlab.png"
  figure_num=figure_num
  description="Gitlab Results"
%}
{% assign figure_num = figure_num | plus: 1 %}



## Conclusion

Besides fixing the errors, VSG has also changed indenting in accordance with it's [default rules](https://vhdl-style-guide.readthedocs.io/en/latest/rules.html). The rules for error detection and indenting are highly [configurable](https://vhdl-style-guide.readthedocs.io/en/latest/configuring.html).

The final result is this beautifully formatted file:

{%
  include vhdl_code_snippet.html
  listing_num=listing_num
  description="Original Half Adder design"
  dir="includes/vhdl-style-guide/"
  file="half_adder_config.vhd"
%}
{% assign listing_num = listing_num | plus: 1 %}

We get a nice clean file, with in theory no manual labor. In practice, even if the tool may not be able to fix certain errors, at least it points them out for you and fixes some of them.

## Changelog

### 2021-04-24

- Update output according to version 3 of VSG, which fixes some previous issues with configuration.
- Add information about JUnit output.
