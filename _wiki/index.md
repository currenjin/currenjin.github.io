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
* [[typescript-compile]]
* [[refactoring]]
* [[lambda-with-api-gateway]]
* [[junit]]
* [[fitnesse]]
* [[elasticsearch]]
* [[sleuth-sqs]]
* [[vaadin]]
* [[specification-pattern]]
* [[ATDD]]
* [[unit-test]]
* [[Mockito]]
* [[docker]]
* [[oop]]
* [[kubernetes]]
* [[docker-compose]]
* [[docker-swarm]]
* [[dockerfile]]
* [[openstack]]
* [[fibonacci]]
* [[graphql]]
* [[slack]]
* [[test]]
* [[polymorphism]]
* [[CDD]]
* [[code-deploy]]
* [[s3]]
* [[annotation]]
* [[TDD]]
* [[subnetting-and-supernetting]]
* [[vrrp]]
* [[bpdu]]
* [[public-ip-private-ip]]
* [[osi-7-layer]]
* [[basic-java]]
* [[git]]
* [[svg]]
* [[n+1]]
* [[multithreaded-javascript]]

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

