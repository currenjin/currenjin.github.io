---
layout  : wikiindex
title   : wiki
toc     : true
public  : true
comment : false
regenerate: true
---

## wiki items

* [[example]]
* [[docker]]
* [[kubernetes]]
* [[docker-compose]]
* [[docker-swarm]]
* [[dockerfile]]
* [[openstack]]
* [[fibonacci]]
* [[slack]]
* [[test]]
* [[polymorphism]]
* [[CDD]]
* [[code-deploy]]
* [[s3]]
* [[annotation]]
* [[TDD]]
* [[basic-java]]
* [[git]]
* [[svg]]

---

## blog posts
<div>
    <ul>
{% for post in site.posts %}
    {% if post.public != false %}
        <li>
            <a class="post-link" href="{{ post.url | prepend: site.baseurl }}">
                {{ post.title }}
            </a>
        </li>
    {% endif %}
{% endfor %}
    </ul>
</div>

