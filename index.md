---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
title: Personal Website
position: Senior Research Scientist for LLMs
location: Bytedance Research, London, United Kingdom
---


<style>
.small-text {
    font-size: 0.9em;
}
        dt {
            float: left;
            clear: left;
            width: 100px;
            text-align: left;
            font-weight: bold;
        }
        dd {
            margin-left: 120px; /* Adjust this value for tab distance */
        }
</style>


## Bio 📖
<p align="justify">
I am currently a Senior Research Scientist at Bytedance Research in London, focusing on Large Language Models (LLMs). My research interests lie in Reward Modelling and Multi-Agent LLM systems. I defended my DPhil in Machine Learning at the University of Oxford under the supervision of Prof. Yee Whye Teh and Prof. Dino Sejdinovic. Prior to my DPhil, I completed my MSc in Applied Statistics at Oxford and BSc in Mathematics at Imperial College London.

My previous research focused on Kernel Methods, Meta-learning, Bayesian Optimization, Uncertainty Quantification and Responsible AI. I have gained valuable industry experience through internships at Amazon in Tübingen, Germany, Apple Inc. in Cupertino, CA, and Bloomberg L.P. in London.
</p>


<br>

### Recent Updates 🔔

{% assign news = site.news | sort: "date" | reverse %}
<div class="small-text">
<dl>
{% for new in news limit: 8 %}
<dt>{{ new.date |date: "%b-%Y"}}</dt>
<dd>{{ new.content }}</dd>
{% endfor %}
</dl>
</div>


<br>

### Upcoming/Recent Talks 🗣️
{% assign talks = site.talks | sort: "date" | reverse %}
<div class="small-text">
<dl>
{% for talk in talks limit: 8 %}
<dt>{{ talk.date |date: "%b-%Y"}}</dt>
<dd><b>{{ talk.talk_title }}</b> 
<br> - <i>{{talk.venue}}</i></dd>
{% endfor %}
</dl>
</div>



