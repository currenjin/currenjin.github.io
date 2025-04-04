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
* [[git]]
* [[svg]]
* [[n+1]]
* [[multithreaded-javascript]]
* [[java-to-kotlin]]
* [[toss-slash-24]]
* [[fixture-monkey-with-jpa]]
* [[spring-bean]]
* [[layered-architecture]]
* [[the-well-grounded-java-developer]]
* [[jpa-deep-dive-by-currenjin]]
* [[street-coder]]
* [[implementation-patterns]]
* [[ERD]]
* [[java-virtual-machine]]
* [[garbage-collection]]

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

